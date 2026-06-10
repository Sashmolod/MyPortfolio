import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AuditLog } from '../entities/audit-log.entity';

describe('UploadController', () => {
  let controller: UploadController;

  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(''),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});