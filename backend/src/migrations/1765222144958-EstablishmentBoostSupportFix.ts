import { MigrationInterface, QueryRunner } from "typeorm";

export class EstablishmentBoostSupportFix1765222144958 implements MigrationInterface {
    name = 'EstablishmentBoostSupportFix1765222144958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        await queryRunner.query(`CREATE TYPE "${schema}"."boosts_type_enum" AS ENUM('TALENT', 'ESTABLISHMENT')`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" ADD "type" "${schema}"."boosts_type_enum" NOT NULL DEFAULT 'TALENT'`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" ADD "establishment_id" uuid`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" ADD "purchased_by_establishment_id" uuid`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" ADD CONSTRAINT "FK_6bff1f21b2cac5fdc9bed4dfee6" FOREIGN KEY ("establishment_id") REFERENCES "${schema}"."establishments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" ADD CONSTRAINT "FK_8980732dd4421b08a89b6e3c356" FOREIGN KEY ("purchased_by_establishment_id") REFERENCES "${schema}"."establishments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" DROP CONSTRAINT "FK_8980732dd4421b08a89b6e3c356"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" DROP CONSTRAINT "FK_6bff1f21b2cac5fdc9bed4dfee6"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" DROP COLUMN "purchased_by_establishment_id"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" DROP COLUMN "establishment_id"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "${schema}"."boosts_type_enum"`);
    }

}
