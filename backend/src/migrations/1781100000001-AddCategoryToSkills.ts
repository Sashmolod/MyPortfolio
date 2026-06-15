import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToSkills1781100000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE skills ADD COLUMN IF NOT EXISTS category_id INTEGER
    `);
    await queryRunner.query(`
      ALTER TABLE skills ADD COLUMN IF NOT EXISTS subcategory_id INTEGER
    `);
    await queryRunner.query(`
      ALTER TABLE skills 
      ADD CONSTRAINT fk_skills_category 
      FOREIGN KEY (category_id) REFERENCES skill_category(id) 
      ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE skills 
      ADD CONSTRAINT fk_skills_subcategory 
      FOREIGN KEY (subcategory_id) REFERENCES skill_category(id) 
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE skills DROP CONSTRAINT IF EXISTS fk_skills_subcategory
    `);
    await queryRunner.query(`
      ALTER TABLE skills DROP CONSTRAINT IF EXISTS fk_skills_category
    `);
    await queryRunner.query(`
      ALTER TABLE skills DROP COLUMN IF EXISTS subcategory_id
    `);
    await queryRunner.query(`
      ALTER TABLE skills DROP COLUMN IF EXISTS category_id
    `);
  }
}