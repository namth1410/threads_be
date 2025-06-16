import { MigrationInterface, QueryRunner } from 'typeorm';

export class Minio1728980787689 implements MigrationInterface {
  name = 'Minio1728980787689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media') THEN
                CREATE TABLE "media" (
                    "id" SERIAL NOT NULL,
                    "url" text NOT NULL,
                    "type" text NOT NULL,
                    "threadId" integer,
                    CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id")
                );
            END IF;
            END $$;
        `);

    await queryRunner.query(`
            DO $$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'FK_8b6565e93811f213070f393116d' AND table_name = 'media'
            ) THEN
                ALTER TABLE "media" ADD CONSTRAINT "FK_8b6565e93811f213070f393116d" FOREIGN KEY ("threadId") REFERENCES "threads"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'FK_8b6565e93811f213070f393116d' AND table_name = 'media'
            ) THEN
                ALTER TABLE "media" DROP CONSTRAINT "FK_8b6565e93811f213070f393116d";
            END IF;
            END $$;
        `);

    await queryRunner.query(`
            DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media') THEN
                DROP TABLE "media";
            END IF;
            END $$;
        `);
  }
}
