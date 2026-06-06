import { Controller, Post, UseInterceptors, UploadedFile, Delete, HttpCode, HttpStatus, Param, UseGuards, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AuditLogInterceptor } from '../audit-log.interceptor';

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
        },
      },
    },
  })
  @ApiOperation({ summary: 'Загрузить изображение' })
  @ApiResponse({ status: 201, description: 'Изображение успешно загружено' })
  @ApiResponse({ status: 400, description: 'Неверный файл' })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    const adjustedFile = this.uploadService.adjustFilename(file);
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
  @ApiResponse({ status: 404, description: 'Файл не найден' })
  deleteImage(@Param('filename') filename: string) {
    const deleted = this.uploadService.deleteFile(filename);
    if (!deleted) {
      throw new Error('File not found');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Получить список загруженных изображений' })
  @ApiResponse({ status: 200, description: 'Список файлов успешно получен' })
  getUploadedFiles() {
    return this.uploadService.getUploadedFiles();
  }
}