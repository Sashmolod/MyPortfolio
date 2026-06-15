import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../shared/entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Найти пользователя по ID (без пароля)
   */
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: id, isActive: true },
      select: ['id', 'username', 'isActive', 'createdAt'],
    });
  }

  /**
   * Найти пользователя по ID с паролем (для смены пароля)
   */
  async findByIdWithPassword(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: id },
      select: ['id', 'username', 'password', 'isActive'],
    });
  }

  /**
   * Найти пользователя по username (с паролем для проверки)
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'isActive', 'loginAttempts', 'lockoutUntil'],
    });
  }

  /**
   * Обновить пользователя по ID (без обновления пароля)
   */
  async update(id: number, partialData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, partialData);
    return this.findById(id);
  }

  /**
   * Создать администратора если его нет
   */
  async createDefaultAdmin(data: Partial<User>): Promise<User> {
    const exists = await this.usersRepository.findOne({
      where: { username: data.username },
    });

    if (exists) {
      return exists;
    }

    const newUser = this.usersRepository.create({
      ...data,
      isActive: true,
      loginAttempts: 0,
      lockoutUntil: null,
    });

    return this.usersRepository.save(newUser);
  }

  /**
   * Увеличить количество неудачных попыток входа
   */
  async incrementLoginAttempts(user: User): Promise<void> {
    const attempts = (user.loginAttempts || 0) + 1;
    const updateData: Partial<User> = { loginAttempts: attempts };
    
    if (attempts >= 5) {
      // Блокировка на 15 минут
      updateData.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await this.usersRepository.update(user.id, updateData);
  }

  /**
   * Сбросить количество неудачных попыток входа
   */
  async resetLoginAttempts(userId: number): Promise<void> {
    await this.usersRepository.update(userId, { loginAttempts: 0, lockoutUntil: null });
  }
}