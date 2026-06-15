import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CaptchaService } from './captcha.service';

describe('CaptchaService', () => {
  let service: CaptchaService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        CAPTCHA_SECRET: 'captcha-secret-key-1234567890',
      };
      return config[key as keyof typeof config];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaptchaService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CaptchaService>(CaptchaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate and verify captcha', () => {
    const { question, token } = service.generateCaptcha();
    expect(question).toBeDefined();
    expect(token).toBeDefined();

    // extract answer from question e.g. "5 + 2 = ?" -> expectedAnswer is 7
    const equation = question.replace(' = ?', '');
    const parts = equation.split(' ');
    const a = parseInt(parts[0], 10);
    const op = parts[1];
    const b = parseInt(parts[2], 10);
    const expectedAnswer = op === '+' ? a + b : a - b;

    const isValid = service.verifyCaptcha(String(expectedAnswer), token);
    expect(isValid).toBe(true);

    const isInvalid = service.verifyCaptcha('999', token);
    expect(isInvalid).toBe(false);
  });

  it('should fail captcha verification with invalid token structure', () => {
    expect(service.verifyCaptcha('5', 'invalidtoken')).toBe(false);
    expect(service.verifyCaptcha('5', 'invalid:token:extra')).toBe(false);
    expect(service.verifyCaptcha('5', 'notanumber:signature')).toBe(false);
    expect(service.verifyCaptcha('5', '12345:signature')).toBe(false); // expired
  });
});
