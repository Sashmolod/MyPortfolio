import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDatabaseIndices1781098401948 implements MigrationInterface {
    name = 'AddDatabaseIndices1781098401948'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "social_links" ("id" SERIAL NOT NULL, "platform" character varying(100) NOT NULL, "url" character varying(255) NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_50d32c67ddd71c09d372b02167f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7774aec66b560f3cc7a4c78e2f" ON "social_links" ("sort_order") `);
        await queryRunner.query(`CREATE INDEX "IDX_27d26dea9b68c0cdf91cd6f516" ON "social_links" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_c5bfabed8b7b7e97d69db18edc" ON "social_links" ("deleted_at") `);
        await queryRunner.query(`ALTER TABLE "hero" DROP COLUMN "social_links_raw"`);
        await queryRunner.query(`ALTER TABLE "hero" DROP COLUMN "social_links"`);
        await queryRunner.query(`CREATE INDEX "IDX_b4a01d5d502d44cf40d8f4cd8f" ON "visit_stats" ("path") `);
        await queryRunner.query(`CREATE INDEX "IDX_880843f753f5439dd0eabfd857" ON "visit_stats" ("visited_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_c9b5b525a96ddc2c5647d7f7fa" ON "users" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_073999dfec9d14522f0cf58cd6" ON "users" ("deleted_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_348b29fa32bf2edc237f3b9deb" ON "skills" ("sort_order") `);
        await queryRunner.query(`CREATE INDEX "IDX_5691383aae0eedf3e760e13bc9" ON "skills" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_9aa39c377c48329b8967d5d859" ON "skills" ("deleted_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_a320904830b3e6e040d848aade" ON "projects" ("sort_order") `);
        await queryRunner.query(`CREATE INDEX "IDX_301eb04c3ee67cb2ab9cb2ab7b" ON "projects" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_11b52372ea51f9159efe2402d9" ON "projects" ("deleted_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_8e34500df0db639fa951586676" ON "jwt_blacklist" ("jti") `);
        await queryRunner.query(`CREATE INDEX "IDX_06b923535c4764253c786d04d6" ON "jwt_blacklist" ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef28645667d5965ce79b307ac6" ON "jwt_blacklist" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_908a54ec69cfd31d676a51029a" ON "hero" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_af75aec64b92aacf7136b2343a" ON "hero" ("deleted_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_11eb2c3d2d9e07f264907f40ef" ON "contact_messages" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_e26cc0a7364a6b5b26d587d367" ON "contact_messages" ("deleted_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_951e6339a77994dfbad976b35c" ON "audit_log" ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_78e013ffae12f5a1fc1dbefff9" ON "audit_log" ("createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_78e013ffae12f5a1fc1dbefff9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_951e6339a77994dfbad976b35c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e26cc0a7364a6b5b26d587d367"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_11eb2c3d2d9e07f264907f40ef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af75aec64b92aacf7136b2343a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_908a54ec69cfd31d676a51029a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef28645667d5965ce79b307ac6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_06b923535c4764253c786d04d6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e34500df0db639fa951586676"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_11b52372ea51f9159efe2402d9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_301eb04c3ee67cb2ab9cb2ab7b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a320904830b3e6e040d848aade"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9aa39c377c48329b8967d5d859"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5691383aae0eedf3e760e13bc9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_348b29fa32bf2edc237f3b9deb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_073999dfec9d14522f0cf58cd6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c9b5b525a96ddc2c5647d7f7fa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_880843f753f5439dd0eabfd857"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4a01d5d502d44cf40d8f4cd8f"`);
        await queryRunner.query(`ALTER TABLE "hero" ADD "social_links" text`);
        await queryRunner.query(`ALTER TABLE "hero" ADD "social_links_raw" text`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5bfabed8b7b7e97d69db18edc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_27d26dea9b68c0cdf91cd6f516"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7774aec66b560f3cc7a4c78e2f"`);
        await queryRunner.query(`DROP TABLE "social_links"`);
    }

}
