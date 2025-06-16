import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTableSession1728897302000 implements MigrationInterface {
  name = 'RenameTableSession1728897302000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'sessions'
            ) THEN
                CREATE TABLE "sessions" (
                    "id" SERIAL NOT NULL, 
                    "userId" integer NOT NULL, 
                    "token" character varying NOT NULL, 
                    "expiresAt" TIMESTAMP NOT NULL, 
                    CONSTRAINT "UQ_e9f62f5dcb8a54b84234c9e7a06" UNIQUE ("token"), 
                    CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")
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
                WHERE table_name = 'sessions'
            ) THEN
                DROP TABLE "sessions";
            END IF;
            END $$;
        `);
  }
}
