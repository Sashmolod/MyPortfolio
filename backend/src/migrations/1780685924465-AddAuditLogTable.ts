import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLogTable1780685924465 implements MigrationInterface {
    name = 'AddAuditLogTable1780685924465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" SERIAL NOT NULL, "username" character varying(255) NOT NULL, "action" character varying(100) NOT NULL, "entityType" character varying(100), "entityId" character varying(50), "payload" text, "ip" character varying(50), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_log"`);
    }

}
