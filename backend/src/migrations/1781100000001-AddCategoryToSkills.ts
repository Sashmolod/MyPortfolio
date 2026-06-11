import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToSkills1781100000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE skills ADD COLUMN IF NOT EXISTS category VARCHAR(100)
    `);
    await queryRunner.query(`
      ALTER TABLE skills ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE skills DROP COLUMN IF EXISTS category
    `);
    await queryRunner.query(`
      ALTER TABLE skills DROP COLUMN IF EXISTS subcategory
    `);
  }
}