import { MigrationInterface, QueryRunner } from "typeorm";

export class EstablishmentBoostSupport1765221727572 implements MigrationInterface {

    name = 'EstablishmentBoostSupport1765221727572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        
        await queryRunner.query(`DROP INDEX "${schema}"."IDX_payments_billing_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        await queryRunner.query(`CREATE INDEX "IDX_payments_billing_id" ON "${schema}"."payments" ("billing_id") `);
    }

}
