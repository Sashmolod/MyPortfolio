import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

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
      select: ['id', 'username', 'password', 'isActive'],
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
    });

    return this.usersRepository.save(newUser);
  }
}