import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import * as multer from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uploadDir = configService.get<string>('UPLOAD_DIR') || join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        return {
          storage: multer.diskStorage({
            destination: (req, file, cb) => cb(null, uploadDir),
            filename: (req, file, cb) => {
              const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(null, `${uniquePrefix}${extname(file.originalname)}`);
            },
          }),
          fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
            const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
            const ext = allowedTypes.test(extname(file.originalname).toLowerCase());
            const mime = allowedTypes.test(file.mimetype);
            if (ext && mime) {
              cb(null, true);
            } else {
              cb(new Error('Только изображения разрешены (jpeg, jpg, png, gif, webp, svg)'), false);
            }
          },
          limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        };
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService, MulterModule],
})
export class UploadModule {}