import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoleUser1729564505815 implements MigrationInterface {
  name = 'RoleUser1729564505815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem kiểu enum đã tồn tại chưa
    await queryRunner.query(`
            DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
                CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'superadmin', 'admin');
            END IF;
            END $$;
        `);

    // Kiểm tra xem cột "role" đã tồn tại chưa
    await queryRunner.query(`
            DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
                ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user';
            END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem cột "role" có tồn tại không trước khi xóa
    await queryRunner.query(`
            DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
                ALTER TABLE "users" DROP COLUMN "role";
            END IF;
            END $$;
        `);

    // Kiểm tra xem kiểu enum có tồn tại không trước khi xóa
    await queryRunner.query(`
            DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
                DROP TYPE "public"."users_role_enum";
            END IF;
            END $$;
        `);
  }
}
