import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1764785745357 implements MigrationInterface {
    name = 'CreateTables1764785745357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        await queryRunner.query(`CREATE TABLE "${schema}"."photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" text NOT NULL, "blur_url" text, "is_main" boolean NOT NULL DEFAULT false, "status" "${schema}"."photos_status_enum" NOT NULL DEFAULT 'PROCESSING', "width" integer, "height" integer, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), "talent_id" uuid, CONSTRAINT "PK_5220c45b8e32d49d767b9b3d725" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "${schema}"."locations_type_enum" NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "is_metropolitan" boolean, "code" character varying, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "opened_at" TIMESTAMP, "closed_at" TIMESTAMP, "parent_id" uuid, CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."talents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "display_name" character varying NOT NULL, "bio" text, "age" smallint, "services" text array NOT NULL DEFAULT '{}', "price_min" integer, "status" "${schema}"."talents_status_enum" NOT NULL DEFAULT 'OFFLINE', "is_boosted" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "hair_color" "${schema}"."talents_hair_color_enum", "eye_color" "${schema}"."talents_eye_color_enum", "body_type" "${schema}"."talents_body_type_enum", "height" smallint, "skin_tone" "${schema}"."talents_skin_tone_enum", "ethnicity" "${schema}"."talents_ethnicity_enum", "measurements" character varying, "weight" smallint, "tattoos" boolean NOT NULL DEFAULT false, "piercings" boolean NOT NULL DEFAULT false, "languages" text array NOT NULL DEFAULT '{}', "availability" character varying, "outcall" boolean NOT NULL DEFAULT false, "incall" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "location_id" uuid, CONSTRAINT "UQ_5064739f1d41c46004fdf648e12" UNIQUE ("slug"), CONSTRAINT "REL_00e580ce176f1118857d1e8a96" UNIQUE ("user_id"), CONSTRAINT "PK_8cecf07c0d624cc503d6a36df52" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" text, "status" "${schema}"."invitations_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "establishment_id" uuid, "talent_id" uuid, CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."establishments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "address" text, "city" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_c2b80fa997e89d62585dc31d0e3" UNIQUE ("slug"), CONSTRAINT "REL_0477b8280db47eaa85ddb7f48e" UNIQUE ("user_id"), CONSTRAINT "PK_7fb6da6c365114ccb61b091bbdf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "${schema}"."users_role_enum" NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."boosts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "start_at" TIMESTAMP WITH TIME ZONE, "end_at" TIMESTAMP WITH TIME ZONE, "duration_days" integer, "payment_id" uuid, "status" "${schema}"."boosts_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "talent_id" uuid, CONSTRAINT "PK_225335d93bbce36b48152a26b48" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "boost_id" uuid, "provider" character varying(64) NOT NULL, "provider_payment_id" character varying(255), "amount_cents" bigint NOT NULL, "currency" character varying(8) NOT NULL DEFAULT 'BRL', "status" "${schema}"."payments_status_enum" NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "refresh_token_hash" character varying NOT NULL, "user_agent" text, "ip_address" character varying(64), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" uuid, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying(128), "resource_type" character varying(64), "resource_id" uuid, "payload" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "${schema}"."photos" ADD CONSTRAINT "FK_cea13eddf7f1fa74d2de2ca139a" FOREIGN KEY ("talent_id") REFERENCES "${schema}"."talents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."locations" ADD CONSTRAINT "FK_ce8370570fc9bb582e9510b94a0" FOREIGN KEY ("parent_id") REFERENCES "${schema}"."locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."talents" ADD CONSTRAINT "FK_00e580ce176f1118857d1e8a964" FOREIGN KEY ("user_id") REFERENCES "${schema}"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."talents" ADD CONSTRAINT "FK_d1b219e487c3f53e9897b400efb" FOREIGN KEY ("location_id") REFERENCES "${schema}"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."invitations" ADD CONSTRAINT "FK_7ca7c0defb01de3653cc811b384" FOREIGN KEY ("establishment_id") REFERENCES "${schema}"."establishments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."invitations" ADD CONSTRAINT "FK_d2eec39810cf3f2c73740d9df3c" FOREIGN KEY ("talent_id") REFERENCES "${schema}"."talents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."establishments" ADD CONSTRAINT "FK_0477b8280db47eaa85ddb7f48e7" FOREIGN KEY ("user_id") REFERENCES "${schema}"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" ADD CONSTRAINT "FK_1e834d0bce64aee43ea4f82ec94" FOREIGN KEY ("talent_id") REFERENCES "${schema}"."talents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."payments" ADD CONSTRAINT "FK_0c2a555bc0ab02a92ec212b18ca" FOREIGN KEY ("boost_id") REFERENCES "${schema}"."boosts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "${schema}"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "${schema}"."audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "${schema}"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schema = (queryRunner.connection.options as any).schema || 'velvet_dev';
        await queryRunner.query(`ALTER TABLE "${schema}"."audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."payments" DROP CONSTRAINT "FK_0c2a555bc0ab02a92ec212b18ca"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."boosts" DROP CONSTRAINT "FK_1e834d0bce64aee43ea4f82ec94"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."establishments" DROP CONSTRAINT "FK_0477b8280db47eaa85ddb7f48e7"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."invitations" DROP CONSTRAINT "FK_d2eec39810cf3f2c73740d9df3c"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."invitations" DROP CONSTRAINT "FK_7ca7c0defb01de3653cc811b384"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."talents" DROP CONSTRAINT "FK_d1b219e487c3f53e9897b400efb"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."talents" DROP CONSTRAINT "FK_00e580ce176f1118857d1e8a964"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."locations" DROP CONSTRAINT "FK_ce8370570fc9bb582e9510b94a0"`);
        await queryRunner.query(`ALTER TABLE "${schema}"."photos" DROP CONSTRAINT "FK_cea13eddf7f1fa74d2de2ca139a"`);
        await queryRunner.query(`DROP TABLE "${schema}"."audit_logs"`);
        await queryRunner.query(`DROP TABLE "${schema}"."sessions"`);
        await queryRunner.query(`DROP TABLE "${schema}"."payments"`);
        await queryRunner.query(`DROP TABLE "${schema}"."boosts"`);
        await queryRunner.query(`DROP TABLE "${schema}"."users"`);
        await queryRunner.query(`DROP TABLE "${schema}"."establishments"`);
        await queryRunner.query(`DROP TABLE "${schema}"."invitations"`);
        await queryRunner.query(`DROP TABLE "${schema}"."talents"`);
        await queryRunner.query(`DROP TABLE "${schema}"."locations"`);
        await queryRunner.query(`DROP TABLE "${schema}"."photos"`);
    }

}
