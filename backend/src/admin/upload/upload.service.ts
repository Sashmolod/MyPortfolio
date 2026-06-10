import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as multer from 'multer';
import { extname, join, resolve } from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || join(process.cwd(), 'uploads');
    // Создаем директорию для загруженных файлов если её нет
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Multer storage options для локального хранения
   */
  getLocalStorageOptions() {
    return {
      destination: (req, file, cb) => cb(null, this.uploadDir),
      filename: (req, file, cb) => {
        // Генерируем уникальное имя файла с префиксом по типу контента
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniquePrefix}${extname(file.originalname)}`);
      },
    };
  }

  /**
   * Фильтр файлов — разрешает только изображения (whitelist MIME + расширений)
   */
  imageFileFilter(req: any, file: Express.Multer.File, cb: any) {
    const ALLOWED_MIMES = new Set([
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ]);
    const ALLOWED_EXTS = new Set(['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg']);

    const ext = ALLOWED_EXTS.has(extname(file.originalname).toLowerCase());
    const mime = ALLOWED_MIMES.has(file.mimetype);

    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Только изображения разрешены (jpeg, jpg, png, gif, webp, svg)'), false);
    }
  }

  /**
   * Обновляет filename у файла, если он не задан
   */
  adjustFilename(file: Express.Multer.File): Express.Multer.File {
    if (!file.filename) {
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      file.filename = `${uniquePrefix}${extname(file.originalname)}`;
    }
    return file;
  }

  /**
   * Получает URL для загруженного файла (относительный путь)
   */
  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  /**
   * Удаляет файл с диска
   */
  deleteFile(filename: string): boolean {
    // Блокируем path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Неверное имя файла');
    }

    const filePath = join(this.uploadDir, filename);
    const normalizedUploadDir = resolve(this.uploadDir);
    const normalizedFilePath = resolve(filePath);

    if (!normalizedFilePath.startsWith(normalizedUploadDir)) {
      throw new BadRequestException('Неверное имя файла');
    }

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Получает абсолютный путь к файлу
   */
  getFilePath(filename: string): string {
    // Блокируем path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Неверное имя файла');
    }

    const filePath = join(this.uploadDir, filename);
    const normalizedUploadDir = resolve(this.uploadDir);
    const normalizedFilePath = resolve(filePath);

    if (!normalizedFilePath.startsWith(normalizedUploadDir)) {
      throw new BadRequestException('Неверное имя файла');
    }

    return filePath;
  }

  /**
   * Проверяет содержимое загруженного файла (например, на наличие скриптов в SVG)
   */
  async validateFileContent(file: Express.Multer.File): Promise<void> {
    const filePath = join(this.uploadDir, file.filename || '');
    if (!fs.existsSync(filePath)) {
      return;
    }

    const isSvg = file.originalname.toLowerCase().endsWith('.svg') || file.mimetype === 'image/svg+xml';
    if (isSvg) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const dangerousPatterns = [
          '<script',
          'javascript:',
          'data:text/html',
          'onerror',
          'onload',
          'onclick',
          'onmouseover',
          '<iframe',
          '<object'
        ];
        
        for (const pattern of dangerousPatterns) {
          if (content.toLowerCase().includes(pattern)) {
            // Удаляем файл с диска
            fs.unlinkSync(filePath);
            throw new BadRequestException('SVG содержит небезопасный исполняемый код (скрипт)');
          }
        }
      } catch (err: any) {
        this.logger.error(`Ошибка при проверке контента файла: ${err.message}`, err.stack);
        if (err instanceof BadRequestException) {
          throw err;
        }
        // Если при проверке возникла ошибка — удаляем файл на всякий случай
        try {
          fs.unlinkSync(filePath);
        } catch {}
        throw new BadRequestException('Не удалось проверить содержимое файла');
      }
    }
  }

  /**
   * Возвращает список всех файлов в директории загрузок
   */
  getUploadedFiles() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        return [];
      }
      const files = fs.readdirSync(this.uploadDir);
      return files
        .filter((file) => {
          return !file.startsWith('.') && fs.statSync(join(this.uploadDir, file)).isFile();
        })
        .map((file) => {
          const stats = fs.statSync(join(this.uploadDir, file));
          return {
            filename: file,
            url: this.getFileUrl(file),
            size: stats.size,
            createdAt: stats.mtime,
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 200); // Ограничиваем вывод до 200 файлов
    } catch (error) {
      console.error('Error reading uploads directory:', error);
      return [];
    }
  }
}