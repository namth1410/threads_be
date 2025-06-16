import { MigrationInterface, QueryRunner } from 'typeorm';

export class TokenVersion1729131267422 implements MigrationInterface {
  name = 'TokenVersion1729131267422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tokenVersion') THEN
                ALTER TABLE "users" ADD "tokenVersion" integer NOT NULL DEFAULT 1;
            END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tokenVersion') THEN
                ALTER TABLE "users" DROP COLUMN "tokenVersion";
            END IF;
            END $$;
        `);
  }
}
