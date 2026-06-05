import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import * as multer from 'multer';

const uploadService = new UploadService();

@Module({
  imports: [
    MulterModule.register({
      storage: multer.diskStorage(uploadService.getLocalStorageOptions()),
      fileFilter: uploadService.imageFileFilter.bind(uploadService),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService, MulterModule],
})
export class UploadModule {}