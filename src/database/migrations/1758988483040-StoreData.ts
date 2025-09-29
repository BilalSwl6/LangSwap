import { MigrationInterface, QueryRunner } from "typeorm";

export class StoreData1758988483040 implements MigrationInterface {
    name = 'StoreData1758988483040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "nativeLanguage" character varying NOT NULL, "practiceLanguages" text NOT NULL, "proficiencyLevel" character varying NOT NULL DEFAULT 'beginner', "minAge" integer NOT NULL DEFAULT '18', "maxAge" integer NOT NULL DEFAULT '99', "allowSameNative" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_b6202d1cacc63a0b9c8dac2abd" UNIQUE ("userId"), CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sessionId" uuid NOT NULL, "senderId" uuid NOT NULL, "message" text NOT NULL, "sentAt" TIMESTAMP NOT NULL DEFAULT now(), "messageType" character varying NOT NULL DEFAULT 'text', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "practice_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user1Id" uuid NOT NULL, "user2Id" uuid NOT NULL, "startedAt" TIMESTAMP NOT NULL DEFAULT now(), "endedAt" TIMESTAMP, "durationSeconds" integer NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'active', "endReason" character varying, "metadata" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_70d97b1cdd66f9b01bd492b92fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "matching_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "socketId" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'searching', "preferences" json NOT NULL, "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), "matchedAt" TIMESTAMP, "matchedWithUserId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5a56e9fff58a7e6878c1af79dc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_a82476a8acdd6cd6936378cb72d" FOREIGN KEY ("sessionId") REFERENCES "practice_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_fc6b58e41e9a871dacbe9077def" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practice_sessions" ADD CONSTRAINT "FK_6c514a0bda1efe4d34f97e0065a" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practice_sessions" ADD CONSTRAINT "FK_3493c1909546dce986ba6e5b0c8" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matching_sessions" ADD CONSTRAINT "FK_752d4b108edea2564afaa4fd3d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "matching_sessions" ADD CONSTRAINT "FK_43754a8804b20985672dc7df6a3" FOREIGN KEY ("matchedWithUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matching_sessions" DROP CONSTRAINT "FK_43754a8804b20985672dc7df6a3"`);
        await queryRunner.query(`ALTER TABLE "matching_sessions" DROP CONSTRAINT "FK_752d4b108edea2564afaa4fd3d1"`);
        await queryRunner.query(`ALTER TABLE "practice_sessions" DROP CONSTRAINT "FK_3493c1909546dce986ba6e5b0c8"`);
        await queryRunner.query(`ALTER TABLE "practice_sessions" DROP CONSTRAINT "FK_6c514a0bda1efe4d34f97e0065a"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_fc6b58e41e9a871dacbe9077def"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_a82476a8acdd6cd6936378cb72d"`);
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4"`);
        await queryRunner.query(`DROP TABLE "matching_sessions"`);
        await queryRunner.query(`DROP TABLE "practice_sessions"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
    }

}
