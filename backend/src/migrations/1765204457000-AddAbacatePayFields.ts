import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAbacatePayFields1733665800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get the schema from the connection or use default
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        
        // Add Abacate Pay fields to payments table
        await queryRunner.query(`
            ALTER TABLE "${schema}"."payments" 
            ADD COLUMN IF NOT EXISTS "billing_id" varchar,
            ADD COLUMN IF NOT EXISTS "pix_qr_code" text,
            ADD COLUMN IF NOT EXISTS "pix_qr_code_base64" text,
            ADD COLUMN IF NOT EXISTS "payment_url" varchar,
            ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
        `);

        // Add index on billing_id for faster lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_payments_billing_id" 
            ON "${schema}"."payments" ("billing_id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        
        await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."IDX_payments_billing_id";`);
        
        await queryRunner.query(`
            ALTER TABLE "${schema}"."payments" 
            DROP COLUMN IF EXISTS "billing_id",
            DROP COLUMN IF EXISTS "pix_qr_code",
            DROP COLUMN IF EXISTS "pix_qr_code_base64",
            DROP COLUMN IF EXISTS "payment_url",
            DROP COLUMN IF EXISTS "expires_at";
        `);
    }
}
