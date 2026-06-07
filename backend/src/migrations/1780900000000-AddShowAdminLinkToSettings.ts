import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShowAdminLinkToSettings1780900000000 implements MigrationInterface {
    name = 'AddShowAdminLinkToSettings1780900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settings" 
            ADD COLUMN "show_admin_link" boolean NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settings" 
            DROP COLUMN "show_admin_link"
        `);
    }
}
