import { Controller, Post, UseInterceptors, UploadedFile, Delete, HttpCode, HttpStatus, Param, UseGuards, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiBearerAuth, ApiTags, ApiProperty, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AuditLogInterceptor } from '../audit-log.interceptor';

export class UploadResponseDto {
  @ApiProperty({ description: 'Успешность операции загрузки', example: true })
  success: boolean;

  @ApiProperty({ description: 'Имя сохраненного файла', example: 'image_1780899000000.png' })
  filename: string;

  @ApiProperty({ description: 'URL-путь для доступа к файлу', example: '/uploads/image_1780899000000.png' })
  url: string;

  @ApiProperty({ description: 'MIME-тип загруженного файла', example: 'image/png' })
  mimetype: string;

  @ApiProperty({ description: 'Размер файла в байтах', example: 102400 })
  size: number;
}

export class UploadedFileDto {
  @ApiProperty({ description: 'Имя файла', example: 'image_1780899000000.png' })
  filename: string;

  @ApiProperty({ description: 'URL-путь для доступа к файлу', example: '/uploads/image_1780899000000.png' })
  url: string;

  @ApiProperty({ description: 'Размер файла в байтах', example: 102400 })
  size: number;

  @ApiProperty({ description: 'Дата загрузки файла', example: '2026-06-06T12:00:00.000Z' })
  createdAt: Date;
}

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth('jwt-in-header')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Изображение для загрузки (JPEG, PNG, GIF, SVG)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Загрузить изображение' })
  @ApiOkResponse({ status: 201, description: 'Изображение успешно загружено', type: UploadResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный файл (неподдерживаемый формат или слишком большой размер)' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    const adjustedFile = this.uploadService.adjustFilename(file);
    await this.uploadService.validateFileContent(adjustedFile);
    return {
      success: true,
      filename: adjustedFile.filename,
      url: this.uploadService.getFileUrl(adjustedFile.filename),
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Delete(':filename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить загруженное изображение' })
  @ApiResponse({ status: 204, description: 'Файл успешно удален' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  deleteImage(@Param('filename') filename: string) {
    const deleted = this.uploadService.deleteFile(filename);
    if (!deleted) {
      throw new Error('File not found');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Получить список загруженных изображений' })
  @ApiOkResponse({ status: 200, description: 'Список файлов успешно получен', type: [UploadedFileDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  getUploadedFiles(): UploadedFileDto[] {
    return this.uploadService.getUploadedFiles();
  }
}