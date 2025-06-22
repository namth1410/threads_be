import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtToUser1750604233127 implements MigrationInterface {
    name = 'AddCreatedAtToUser1750604233127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "threads" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "threads" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "threads" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "threads" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
