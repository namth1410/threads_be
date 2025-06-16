import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFileNameMedia1729061327831 implements MigrationInterface {
  name = 'UpdateFileNameMedia1729061327831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'fileName') THEN
                ALTER TABLE "media" ADD "fileName" text NOT NULL;
            END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'fileName') THEN
                ALTER TABLE "media" DROP COLUMN "fileName";
            END IF;
            END $$;
        `);
  }
}
