import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateThreadEntity1749696637749 implements MigrationInterface {
    name = 'UpdateThreadEntity1749696637749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "threads" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "threads" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "threads" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "threads" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "threads" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "threads" DROP COLUMN "deletedAt"`);
    }

}
