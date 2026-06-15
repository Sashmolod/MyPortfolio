import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class CaptchaService {
  constructor(private configService: ConfigService) {}

  generateCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1; // 1-9
    const b = Math.floor(Math.random() * 9) + 1; // 1-9
    const isPlus = Math.random() > 0.5;
    
    let question = '';
    let expectedAnswer = 0;
    
    if (isPlus) {
      question = `${a} + ${b} = ?`;
      expectedAnswer = a + b;
    } else {
      const maxVal = Math.max(a, b);
      const minVal = Math.min(a, b);
      question = `${maxVal} - ${minVal} = ?`;
      expectedAnswer = maxVal - minVal;
    }
    
    const captchaSecret = this.configService.get<string>('CAPTCHA_SECRET');
    if (!captchaSecret) {
      throw new Error('CAPTCHA_SECRET is not configured');
    }
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 mins
    
    const hmac = createHmac('sha256', captchaSecret);
    hmac.update(`${expectedAnswer}:${expiresAt}`);
    const signature = hmac.digest('hex');
    
    const token = `${expiresAt}:${signature}`;
    
    return { question, token };
  }

  verifyCaptcha(answer: string, token: string): boolean {
    if (!token || !answer) {
      return false;
    }
    
    const parts = token.split(':');
    if (parts.length !== 2) {
      return false;
    }
    
    const [expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    
    if (isNaN(expiresAt) || expiresAt < Date.now()) {
      return false;
    }
    
    const captchaSecret = this.configService.get<string>('CAPTCHA_SECRET');
    if (!captchaSecret) {
      return false;
    }
    const cleanAnswer = answer.trim();
    
    const hmac = createHmac('sha256', captchaSecret);
    hmac.update(`${cleanAnswer}:${expiresAtStr}`);
    const expectedSignature = hmac.digest('hex');
    
    return signature === expectedSignature;
  }
}
