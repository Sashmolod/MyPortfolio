import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTechnologiesFromProjects1781300000000 implements MigrationInterface {
    name = 'RemoveTechnologiesFromProjects1781300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "technologies"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN "technologies" text`);
    }
}