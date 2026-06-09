import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminUsername || !adminPassword) {
      this.logger.warn('ADMIN_USERNAME or ADMIN_PASSWORD not configured. Skipping seed.');
      return;
    }

    try {
      const saltRounds = 12;
      const hashedPassword = bcrypt.hashSync(adminPassword, saltRounds);

      const existingUserCount = await this.userRepo.count();

      if (existingUserCount === 0) {
        await this.userRepo.save(
          this.userRepo.create({
            username: adminUsername,
            password: hashedPassword,
            isActive: true,
          }),
        );
        this.logger.log(`Default administrator created: ${adminUsername}`);
      } else {
        const existingUser = await this.userRepo.findOne({ where: { username: adminUsername } });
        if (existingUser) {
          await this.userRepo.update(existingUser.id, { password: hashedPassword });
          this.logger.log(`Password for administrator ${adminUsername} updated successfully.`);
        } else {
          await this.userRepo.save(
            this.userRepo.create({
              username: adminUsername,
              password: hashedPassword,
              isActive: true,
            }),
          );
          this.logger.log(`Administrator created: ${adminUsername}`);
        }
      }
    } catch (error: any) {
      this.logger.error(`Error during admin seeding: ${error.message}`);
    }
  }
}
