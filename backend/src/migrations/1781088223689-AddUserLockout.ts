import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLockout1781088223689 implements MigrationInterface {
    name = 'AddUserLockout1781088223689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_visited_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ip_path_day"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "login_attempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lockout_until" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lockout_until"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "login_attempts"`);
        await queryRunner.query(`CREATE INDEX "IDX_ip_path_day" ON "visit_stats" ("ip_address", "path", "visited_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_visited_at" ON "visit_stats" ("visited_at") `);
    }

}
