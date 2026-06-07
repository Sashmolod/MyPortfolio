import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSettingsTable1780899000000 implements MigrationInterface {
    name = 'CreateSettingsTable1780899000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "settings" (
                "id" integer NOT NULL DEFAULT 1,
                "enable_doodly" boolean NOT NULL DEFAULT true,
                "enable_sounds" boolean NOT NULL DEFAULT true,
                "enable_bug" boolean NOT NULL DEFAULT true,
                "enable_page_tear" boolean NOT NULL DEFAULT true,
                "enable_ink_leak" boolean NOT NULL DEFAULT true,
                "enable_coffee_spill" boolean NOT NULL DEFAULT true,
                "enable_draw_skills" boolean NOT NULL DEFAULT true,
                "enable_eraser" boolean NOT NULL DEFAULT true,
                "enable_crumpled_page_transition" boolean NOT NULL DEFAULT true,
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_settings" PRIMARY KEY ("id")
            )
        `);
        // Seed default row inside migration
        await queryRunner.query(`
            INSERT INTO "settings" (
                "id", "enable_doodly", "enable_sounds", "enable_bug", "enable_page_tear", 
                "enable_ink_leak", "enable_coffee_spill", "enable_draw_skills", "enable_eraser", 
                "enable_crumpled_page_transition"
            ) VALUES (1, true, true, true, true, true, true, true, true, true)
            ON CONFLICT ("id") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "settings"`);
    }
}
