import { MigrationInterface, QueryRunner } from "typeorm";

export class AnalyticsTables1765225742805 implements MigrationInterface {
    name = 'AnalyticsTables1765225742805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        await queryRunner.query(`CREATE TYPE "${schema}"."profile_views_profile_type_enum" AS ENUM('TALENT', 'ESTABLISHMENT')`);
        await queryRunner.query(`CREATE TYPE "${schema}"."profile_views_device_type_enum" AS ENUM('desktop', 'mobile', 'tablet')`);
        await queryRunner.query(`CREATE TABLE "${schema}"."profile_views" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_type" "${schema}"."profile_views_profile_type_enum" NOT NULL, "profile_id" uuid NOT NULL, "session_id" character varying, "user_id" uuid, "ip_address" character varying(45), "user_agent" text, "referrer" character varying, "device_type" "${schema}"."profile_views_device_type_enum", "viewed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d097089dc034d5c56a396ae2fd2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8d766450cdbcf4474b6fc2f110" ON "${schema}"."profile_views" ("viewed_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc6354b8fa481859a6d0432755" ON "${schema}"."profile_views" ("session_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3fe0a8a0df8229e34dcd16f47" ON "${schema}"."profile_views" ("profile_type", "profile_id") `);
        await queryRunner.query(`CREATE TYPE "${schema}"."search_impressions_profile_type_enum" AS ENUM('TALENT', 'ESTABLISHMENT')`);
        await queryRunner.query(`CREATE TABLE "${schema}"."search_impressions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_type" "${schema}"."search_impressions_profile_type_enum" NOT NULL, "profile_id" uuid NOT NULL, "search_query" character varying, "position" integer, "page" integer NOT NULL DEFAULT '1', "session_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4060c586d5353253d2f8bc8dfc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_515a6508e118f3e01ccd841484" ON "${schema}"."search_impressions" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_47062fdbb55ebf2724e93caeb9" ON "${schema}"."search_impressions" ("profile_type", "profile_id") `);
        await queryRunner.query(`CREATE TYPE "${schema}"."profile_interactions_profile_type_enum" AS ENUM('TALENT', 'ESTABLISHMENT')`);
        await queryRunner.query(`CREATE TYPE "${schema}"."profile_interactions_interaction_type_enum" AS ENUM('CONTACT_CLICK', 'PHONE_REVEAL', 'WHATSAPP_CLICK', 'INVITE_CLICK', 'EMAIL_CLICK')`);
        await queryRunner.query(`CREATE TABLE "${schema}"."profile_interactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_type" "${schema}"."profile_interactions_profile_type_enum" NOT NULL, "profile_id" uuid NOT NULL, "interaction_type" "${schema}"."profile_interactions_interaction_type_enum" NOT NULL, "session_id" character varying, "user_id" uuid, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f045323fdc1ca90ece1b3f6e124" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9b6b5318971f6a687549754366" ON "${schema}"."profile_interactions" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_64a188625de4440064b2c5692a" ON "${schema}"."profile_interactions" ("interaction_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_6fcf567da1261f86d577e97e5e" ON "${schema}"."profile_interactions" ("profile_type", "profile_id") `);
        await queryRunner.query(`ALTER TABLE "${schema}"."profile_views" ADD CONSTRAINT "FK_ce52459b01be335d634f078df9b" FOREIGN KEY ("user_id") REFERENCES "${schema}"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."profile_interactions" ADD CONSTRAINT "FK_40650a7861bcfb56097a880cfab" FOREIGN KEY ("user_id") REFERENCES "${schema}"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        await queryRunner.query(`ALTER TABLE "${schema}"."profile_interactions" DROP CONSTRAINT "FK_40650a7861bcfb56097a880cfab"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."profile_views" DROP CONSTRAINT "FK_ce52459b01be335d634f078df9b"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_6fcf567da1261f86d577e97e5e"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_64a188625de4440064b2c5692a"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_9b6b5318971f6a687549754366"`);
        await queryRunner.query(`DROP TABLE "${schema}"."profile_interactions"`);
        await queryRunner.query(`DROP TYPE "${schema}"."profile_interactions_interaction_type_enum"`);
        await queryRunner.query(`DROP TYPE "${schema}"."profile_interactions_profile_type_enum"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_47062fdbb55ebf2724e93caeb9"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_515a6508e118f3e01ccd841484"`);
        await queryRunner.query(`DROP TABLE "${schema}"."search_impressions"`);
        await queryRunner.query(`DROP TYPE "${schema}"."search_impressions_profile_type_enum"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_a3fe0a8a0df8229e34dcd16f47"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_dc6354b8fa481859a6d0432755"`);
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_8d766450cdbcf4474b6fc2f110"`);
        await queryRunner.query(`DROP TABLE "${schema}"."profile_views"`);
        await queryRunner.query(`DROP TYPE "${schema}"."profile_views_device_type_enum"`);
        await queryRunner.query(`DROP TYPE "${schema}"."profile_views_profile_type_enum"`);
    }

}
