import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSession1728896968573 implements MigrationInterface {
  name = 'AddSession1728896968573';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'session_entity'
            ) THEN
                CREATE TABLE "session_entity" (
                    "id" SERIAL NOT NULL, 
                    "userId" integer NOT NULL, 
                    "token" character varying NOT NULL, 
                    "expiresAt" TIMESTAMP NOT NULL, 
                    CONSTRAINT "UQ_aa53874cf4e3e4b63fd28f51641" UNIQUE ("token"), 
                    CONSTRAINT "PK_897bc09b92e1a7ef6b30cba4786" PRIMARY KEY ("id")
                );
            END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'session_entity'
            ) THEN
                DROP TABLE "session_entity";
            END IF;
            END $$;
        `);
  }
}
