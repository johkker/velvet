# Migration Best Practices for TypeORM with Schema

## ✅ Recommended Approach: Use QueryRunner Connection Options

Instead of hardcoding schema names, always fetch it from the connection:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class YourMigration implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get schema from connection (defaults to 'public')
        const schema = queryRunner.connection.options.schema || 'public';
        
        // Use template literals with the schema variable
        await queryRunner.query(`
            ALTER TABLE "${schema}"."your_table" 
            ADD COLUMN "new_field" varchar;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = queryRunner.connection.options.schema || 'public';
        
        await queryRunner.query(`
            ALTER TABLE "${schema}"."your_table" 
            DROP COLUMN "new_field";
        `);
    }
}
```

## 📋 Configuration in .env

Add to your `.env` file:

```env
DATABASE_SCHEMA=velvet_dev
```

## 🎯 Why This Approach?

### ✅ Advantages:
1. **Environment-agnostic** - Works in dev, staging, production
2. **No hardcoding** - Schema comes from configuration
3. **TypeORM native** - Uses built-in connection options
4. **DRY principle** - Single source of truth (data-source.ts)
5. **Easy testing** - Can switch schemas for testing

### ❌ Avoid:
```typescript
// ❌ Don't hardcode schema names
await queryRunner.query(`ALTER TABLE "velvet_dev"."payments" ...`);

// ❌ Don't use process.env directly in migrations
const schema = process.env.DATABASE_SCHEMA; // Not loaded in migration context
```

## 🔧 data-source.ts Configuration

Your DataSource should already include:

```typescript
export const AppDataSource = new DataSource({
    type: 'postgres',
    schema: process.env.DATABASE_SCHEMA || 'public',
    // ... other options
});
```

## 📝 Migration Template

Use this template for all future migrations:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1234567890 implements MigrationInterface {
    private getSchema(queryRunner: QueryRunner): string {
        return queryRunner.connection.options.schema || 'public';
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = this.getSchema(queryRunner);
        
        // Your migration logic here
        await queryRunner.query(`
            CREATE TABLE "${schema}"."your_table" (
                id uuid DEFAULT uuid_generate_v4(),
                -- columns
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = this.getSchema(queryRunner);
        
        await queryRunner.query(`DROP TABLE "${schema}"."your_table";`);
    }
}
```

## 🚀 Alternative: Helper Function

For complex migrations, create a helper:

```typescript
// migrations/helpers/schema.ts
export function getSchemaName(queryRunner: QueryRunner): string {
    return queryRunner.connection.options.schema || 'public';
}

export function table(queryRunner: QueryRunner, tableName: string): string {
    const schema = getSchemaName(queryRunner);
    return `"${schema}"."${tableName}"`;
}

// Usage in migration:
import { table } from './helpers/schema';

await queryRunner.query(`
    ALTER TABLE ${table(queryRunner, 'payments')} 
    ADD COLUMN "new_field" varchar;
`);
```

## 🎯 Best Practices Summary

1. ✅ Always use `queryRunner.connection.options.schema`
2. ✅ Set `DATABASE_SCHEMA` in `.env`
3. ✅ Use template literals for dynamic schema names
4. ✅ Provide fallback to `'public'`
5. ✅ Test migrations in multiple environments
6. ❌ Never hardcode schema names
7. ❌ Don't use `process.env` directly in migrations

---

This ensures your migrations work correctly across all environments (dev, staging, production) regardless of schema name! 🎉
