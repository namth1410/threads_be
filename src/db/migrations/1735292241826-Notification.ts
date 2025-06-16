import { MigrationInterface, QueryRunner } from "typeorm";

export class Notification1735292241826 implements MigrationInterface {
    name = 'Notification1735292241826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('IMMEDIATE', 'SCHEDULED')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_status_enum" AS ENUM('READ', 'SENT')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "message" character varying NOT NULL, "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'IMMEDIATE', "scheduleAt" TIMESTAMP, "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'SENT', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" integer NOT NULL, "recipientId" integer, "sendToAll" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    }

}
