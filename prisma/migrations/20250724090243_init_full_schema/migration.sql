/*
  Warnings:

  - The primary key for the `Subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `product_id` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Made the column `customer_first_name` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customer_middle_name` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customer_last_name` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipping_line_1` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipping_line_2` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipping_line_3` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipping_city` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipping_postcode` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipping_state` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipping_country` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `company_name` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `company_trading_name` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `company_number` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `organisation_type` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Made the column `telephone_number` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start_date` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Subscription_external_id_key";

-- AlterTable
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
DROP COLUMN "product_id",
ADD COLUMN     "product_id" INTEGER NOT NULL,
ALTER COLUMN "customer_first_name" SET NOT NULL,
ALTER COLUMN "customer_middle_name" SET NOT NULL,
ALTER COLUMN "customer_last_name" SET NOT NULL,
ALTER COLUMN "review_status" SET DEFAULT 'PENDING',
ALTER COLUMN "shipping_line_1" SET NOT NULL,
ALTER COLUMN "shipping_line_2" SET NOT NULL,
ALTER COLUMN "shipping_line_3" SET NOT NULL,
ALTER COLUMN "shipping_city" SET NOT NULL,
ALTER COLUMN "shipping_postcode" SET NOT NULL,
ALTER COLUMN "shipping_state" SET NOT NULL,
ALTER COLUMN "shipping_country" SET NOT NULL,
ALTER COLUMN "company_name" SET NOT NULL,
ALTER COLUMN "company_trading_name" SET NOT NULL,
ALTER COLUMN "company_number" SET NOT NULL,
DROP COLUMN "organisation_type",
ADD COLUMN     "organisation_type" INTEGER NOT NULL,
ALTER COLUMN "telephone_number" SET NOT NULL,
ALTER COLUMN "start_date" SET NOT NULL,
ALTER COLUMN "start_date" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("external_id");

-- CreateTable
CREATE TABLE "KycToken" (
    "token" TEXT NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "plan_name" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "kyc_submitted" INTEGER NOT NULL DEFAULT 0,
    "session_id" TEXT,

    CONSTRAINT "KycToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" SERIAL NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScannedMail" (
    "id" SERIAL NOT NULL,
    "external_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "url_envelope_front" TEXT,
    "url_envelope_back" TEXT,
    "file_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMP(3) NOT NULL,
    "company_name" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "document_title" TEXT NOT NULL,
    "reference_number" TEXT,
    "summary" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "sub_categories" TEXT NOT NULL,
    "key_information" TEXT,
    "is_forwarded" BOOLEAN NOT NULL DEFAULT false,
    "forwarded_at" TIMESTAMP(3),

    CONSTRAINT "ScannedMail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KycToken_email_idx" ON "KycToken"("email");

-- CreateIndex
CREATE INDEX "KycToken_token_idx" ON "KycToken"("token");

-- CreateIndex
CREATE INDEX "KycToken_session_id_idx" ON "KycToken"("session_id");

-- CreateIndex
CREATE INDEX "CompanyMember_id_idx" ON "CompanyMember"("id");

-- CreateIndex
CREATE INDEX "ScannedMail_id_idx" ON "ScannedMail"("id");

-- CreateIndex
CREATE INDEX "ScannedMail_external_id_idx" ON "ScannedMail"("external_id");

-- CreateIndex
CREATE INDEX "Subscription_customer_email_idx" ON "Subscription"("customer_email");

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("external_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannedMail" ADD CONSTRAINT "ScannedMail_external_id_fkey" FOREIGN KEY ("external_id") REFERENCES "Subscription"("external_id") ON DELETE RESTRICT ON UPDATE CASCADE;
