import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetStatsDto } from './stats/dto/stats.dto';
import { CreateSkillDto } from './admin/dto/create-skill.dto';
import { CreateContactMessageDto } from './admin/dto/create-contact-message.dto';
import { ChangePasswordDto } from './admin/dto/change-password.dto';
import { LoginDto } from './admin/dto/login.dto';

describe('DTO Validation', () => {
  const validateDto = async (dtoClass: any, payload: any) => {
    const instance = plainToInstance(dtoClass, payload);
    return await validate(instance);
  };

  describe('GetStatsDto', () => {
    it('should pass with valid query params', async () => {
      const payload = { page: 2, limit: 10, path: '/projects', startDate: '2026-06-01T00:00:00.000Z', endDate: '2026-06-30T00:00:00.000Z' };
      const errors = await validateDto(GetStatsDto, payload);
      expect(errors.length).toBe(0);
    });

    it('should fail with page/limit less than 1', async () => {
      const payload = { page: 0, limit: 0 };
      const errors = await validateDto(GetStatsDto, payload);
      expect(errors.length).toBeGreaterThan(0);
      
      const pageError = errors.find(e => e.property === 'page');
      expect(pageError).toBeDefined();
      expect(pageError?.constraints?.min).toBeDefined();

      const limitError = errors.find(e => e.property === 'limit');
      expect(limitError).toBeDefined();
      expect(limitError?.constraints?.min).toBeDefined();
    });

    it('should fail with invalid dates', async () => {
      const payload = { startDate: 'invalid-date' };
      const errors = await validateDto(GetStatsDto, payload);
      expect(errors.length).toBeGreaterThan(0);
      
      const dateError = errors.find(e => e.property === 'startDate');
      expect(dateError).toBeDefined();
    });
  });

  describe('CreateSkillDto', () => {
    it('should pass with valid skill details', async () => {
      const payload = { name: 'JavaScript', level: 90, sortOrder: 1 };
      const errors = await validateDto(CreateSkillDto, payload);
      expect(errors.length).toBe(0);
    });

    it('should fail with empty name', async () => {
      const payload = { name: '', level: 90 };
      const errors = await validateDto(CreateSkillDto, payload);
      expect(errors.length).toBeGreaterThan(0);
      
      const nameError = errors.find(e => e.property === 'name');
      expect(nameError).toBeDefined();
    });
    it('should clamp level to 0-100 via transform', async () => {
      const payloadHigh = { name: 'Go', level: 150 };
      const payloadLow = { name: 'Go', level: -10 };

      const instanceHigh = plainToInstance(CreateSkillDto, payloadHigh);
      expect(instanceHigh.level).toBe(100);
      const errorsHigh = await validate(instanceHigh);
      expect(errorsHigh.length).toBe(0);

      const instanceLow = plainToInstance(CreateSkillDto, payloadLow);
      expect(instanceLow.level).toBe(0);
      const errorsLow = await validate(instanceLow);
      expect(errorsLow.length).toBe(0);
    });
  });

  describe('CreateContactMessageDto', () => {
    it('should pass with valid contact form data', async () => {
      const payload = {
        name: 'Alice',
        email: 'alice@example.com',
        subject: 'Inquiry',
        message: 'Hello, I like your work!',
      };
      const errors = await validateDto(CreateContactMessageDto, payload);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid email', async () => {
      const payload = {
        name: 'Alice',
        email: 'not-an-email',
        subject: 'Inquiry',
        message: 'Hello',
      };
      const errors = await validateDto(CreateContactMessageDto, payload);
      expect(errors.length).toBeGreaterThan(0);
      
      const emailError = errors.find(e => e.property === 'email');
      expect(emailError).toBeDefined();
    });

    it('should fail with missing fields', async () => {
      const payload = {
        name: '',
        email: '',
        message: '',
      };
      const errors = await validateDto(CreateContactMessageDto, payload);
      expect(errors.length).toBeGreaterThan(0);

      expect(errors.find(e => e.property === 'name')).toBeDefined();
      expect(errors.find(e => e.property === 'email')).toBeDefined();
      expect(errors.find(e => e.property === 'message')).toBeDefined();
    });
  });

  describe('ChangePasswordDto', () => {
    it('should fail if new password is too short', async () => {
      const payload = { currentPassword: 'old', newPassword: '123' };
      const errors = await validateDto(ChangePasswordDto, payload);
      expect(errors.length).toBeGreaterThan(0);
      
      const passError = errors.find(e => e.property === 'newPassword');
      expect(passError).toBeDefined();
    });

    it('should fail with empty currentPassword', async () => {
      const payload = { currentPassword: '', newPassword: 'valid-new-password' };
      const errors = await validateDto(ChangePasswordDto, payload);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.find(e => e.property === 'currentPassword')).toBeDefined();
    });
  });

  describe('LoginDto', () => {
    it('should fail if password is too short', async () => {
      const payload = { username: 'admin', password: '123' };
      const errors = await validateDto(LoginDto, payload);
      expect(errors.length).toBeGreaterThan(0);
      
      const passError = errors.find(e => e.property === 'password');
      expect(passError).toBeDefined();
    });

    it('should fail with empty username', async () => {
      const payload = { username: '', password: 'valid-password' };
      const errors = await validateDto(LoginDto, payload);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.find(e => e.property === 'username')).toBeDefined();
    });
  });
});
