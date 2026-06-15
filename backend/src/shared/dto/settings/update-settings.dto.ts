import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Enable Doodly (Smart Clip Helper) widget', example: true })
  @IsBoolean()
  @IsOptional()
  enableDoodly?: boolean;

  @ApiPropertyOptional({ description: 'Enable global sound effects (Web Audio API)', example: true })
  @IsBoolean()
  @IsOptional()
  enableSounds?: boolean;

  @ApiPropertyOptional({ description: 'Enable crawling bug easter egg', example: true })
  @IsBoolean()
  @IsOptional()
  enableBug?: boolean;

  @ApiPropertyOptional({ description: 'Enable page-tear corner Tic-Tac-Toe easter egg', example: true })
  @IsBoolean()
  @IsOptional()
  enablePageTear?: boolean;

  @ApiPropertyOptional({ description: 'Enable ink leak double-click easter egg', example: true })
  @IsBoolean()
  @IsOptional()
  enableInkLeak?: boolean;

  @ApiPropertyOptional({ description: 'Enable interactive coffee cup spill easter egg', example: true })
  @IsBoolean()
  @IsOptional()
  enableCoffeeSpill?: boolean;

  @ApiPropertyOptional({ description: 'Enable scroll-based draw-in skill outline animations', example: true })
  @IsBoolean()
  @IsOptional()
  enableDrawSkills?: boolean;

  @ApiPropertyOptional({ description: 'Enable interactive webpage eraser tool', example: true })
  @IsBoolean()
  @IsOptional()
  enableEraser?: boolean;

  @ApiPropertyOptional({ description: 'Enable page crumple transition animation on navigate', example: true })
  @IsBoolean()
  @IsOptional()
  enableCrumpledPageTransition?: boolean;

  @ApiPropertyOptional({ description: 'Show Admin link in the header', example: true })
  @IsBoolean()
  @IsOptional()
  showAdminLink?: boolean;
}
