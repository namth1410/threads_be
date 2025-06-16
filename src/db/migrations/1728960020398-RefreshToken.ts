import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshToken1728960020398 implements MigrationInterface {
  name = 'RefreshToken1728960020398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'refreshToken'
            ) THEN
                ALTER TABLE "sessions" ADD "refreshToken" character varying NOT NULL;
            END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'refreshToken'
            ) THEN
                ALTER TABLE "sessions" DROP COLUMN "refreshToken";
            END IF;
            END $$;
        `);
  }
}
