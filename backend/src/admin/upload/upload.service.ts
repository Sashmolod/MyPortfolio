import { Injectable } from '@nestjs/common';
import * as multer from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');

  constructor() {
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
   * Фильтр файлов — разрешает только изображения
   */
  imageFileFilter(req: any, file: Express.Multer.File, cb: any) {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowedTypes.test(extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены (jpeg, jpg, png, gif, webp, svg)'), false);
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
    const filePath = join(this.uploadDir, filename);
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
    return join(this.uploadDir, filename);
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
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error reading uploads directory:', error);
      return [];
    }
  }
}