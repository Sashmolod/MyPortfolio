import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('portfolio')
@Controller('portfolio/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get dynamic template backend capabilities config' })
  getConfig() {
    return {
      statsEnabled: this.configService.get<string>('ENABLE_STATS_MODULE') !== 'false',
    };
  }
}
