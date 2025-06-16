import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class DisplayIdUserAndVisibilityThread1730370590023
  implements MigrationInterface
{
  name = 'DisplayIdUserAndVisibilityThread1730370590023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra sự tồn tại của kiểu enum "threads_visibility_enum"
    await queryRunner.query(`
      DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'threads_visibility_enum') THEN
        CREATE TYPE "public"."threads_visibility_enum" AS ENUM('public', 'private', 'followers_only');
      END IF;
      END $$;
    `);

    // Kiểm tra sự tồn tại của cột "visibility" trong bảng "threads"
    await queryRunner.query(`
      DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'threads' AND column_name = 'visibility') THEN
        ALTER TABLE "threads" ADD "visibility" "public"."threads_visibility_enum" NOT NULL DEFAULT 'public';
      END IF;
      END $$;
    `);

    // Thêm cột "displayId" vào bảng "users" nếu chưa tồn tại
    await queryRunner.query(`
      DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'displayId') THEN
        ALTER TABLE "users" ADD "displayId" character varying;
      END IF;
      END $$;
    `);

    // Cập nhật tất cả các hàng hiện có với giá trị UUID
    const users = await queryRunner.query(`SELECT id FROM "users"`);
    for (const user of users) {
      const displayId = uuidv4(); // Tạo UUID mới cho mỗi user
      await queryRunner.query(
        `UPDATE "users" SET "displayId" = '${displayId}' WHERE "id" = ${user.id}`,
      );
    }

    // Thay đổi cột "displayId" thành NOT NULL nếu chưa tồn tại
    await queryRunner.query(`
      DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'displayId' AND is_nullable = 'YES') THEN
        ALTER TABLE "users" ALTER COLUMN "displayId" SET NOT NULL;
      END IF;
      END $$;
    `);

    // Đảm bảo rằng cột "displayId" là UNIQUE
    await queryRunner.query(`
      DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_fab8abf5c6f575391f6e6005322') THEN
        ALTER TABLE "users" ADD CONSTRAINT "UQ_fab8abf5c6f575391f6e6005322" UNIQUE ("displayId");
      END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa constraint UNIQUE nếu tồn tại
    await queryRunner.query(`
      DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_fab8abf5c6f575391f6e6005322') THEN
        ALTER TABLE "users" DROP CONSTRAINT "UQ_fab8abf5c6f575391f6e6005322";
      END IF;
      END $$;
    `);

    // Xóa cột "displayId" nếu tồn tại
    await queryRunner.query(`
      DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'displayId') THEN
        ALTER TABLE "users" DROP COLUMN "displayId";
      END IF;
      END $$;
    `);

    // Xóa cột "visibility" trong bảng "threads" nếu tồn tại
    await queryRunner.query(`
      DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'threads' AND column_name = 'visibility') THEN
        ALTER TABLE "threads" DROP COLUMN "visibility";
      END IF;
      END $$;
    `);

    // Xóa kiểu enum "threads_visibility_enum" nếu tồn tại
    await queryRunner.query(`
      DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'threads_visibility_enum') THEN
        DROP TYPE "public"."threads_visibility_enum";
      END IF;
      END $$;
    `);
  }
}
