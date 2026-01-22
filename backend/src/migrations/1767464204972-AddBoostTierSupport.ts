import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBoostTierSupport1767464204972 implements MigrationInterface {
    name = 'AddBoostTierSupport1767464204972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" ADD "talent_ids" jsonb`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" ADD "boost_tier" character varying`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" ADD "discount_percentage" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "velvet_dev"."boosts_type_enum" RENAME TO "boosts_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "velvet_dev"."boosts_type_enum" AS ENUM('TALENT', 'ESTABLISHMENT_PROFILE', 'TALENT_BULK')`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" ALTER COLUMN "type" TYPE "velvet_dev"."boosts_type_enum" USING "type"::"text"::"velvet_dev"."boosts_type_enum"`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" ALTER COLUMN "type" SET DEFAULT 'TALENT'`);
        await queryRunner.query(`DROP TYPE "velvet_dev"."boosts_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "velvet_dev"."boosts_type_enum_old" AS ENUM('TALENT', 'ESTABLISHMENT')`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" ALTER COLUMN "type" TYPE "velvet_dev"."boosts_type_enum_old" USING "type"::"text"::"velvet_dev"."boosts_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" ALTER COLUMN "type" SET DEFAULT 'TALENT'`);
        await queryRunner.query(`DROP TYPE "velvet_dev"."boosts_type_enum"`);
        await queryRunner.query(`ALTER TYPE "velvet_dev"."boosts_type_enum_old" RENAME TO "boosts_type_enum"`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" DROP COLUMN "discount_percentage"`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" DROP COLUMN "boost_tier"`);
        await queryRunner.query(`ALTER TABLE "velvet_dev"."boosts" DROP COLUMN "talent_ids"`);
    }

}
