import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeParentNameToParentId1781100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create skill_category table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "skill_category" (
        "id" SERIAL NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "parent_id" INTEGER,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_skill_category" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint for self-referencing parent
    await queryRunner.query(`
      ALTER TABLE skill_category
      ADD CONSTRAINT fk_skill_category_parent
      FOREIGN KEY (parent_id) REFERENCES skill_category(id)
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.query(`
      ALTER TABLE skill_category DROP CONSTRAINT IF EXISTS fk_skill_category_parent
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS skill_category`);
  }
}