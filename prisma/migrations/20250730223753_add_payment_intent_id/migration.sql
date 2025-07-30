-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "balance_pennies" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Subscription" (
    "external_id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "customer_first_name" TEXT NOT NULL,
    "customer_middle_name" TEXT NOT NULL,
    "customer_last_name" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "review_status" TEXT NOT NULL DEFAULT 'PENDING',
    "shipping_line_1" TEXT NOT NULL,
    "shipping_line_2" TEXT NOT NULL,
    "shipping_line_3" TEXT NOT NULL,
    "shipping_city" TEXT NOT NULL,
    "shipping_postcode" TEXT NOT NULL,
    "shipping_state" TEXT NOT NULL,
    "shipping_country" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_trading_name" TEXT NOT NULL,
    "company_number" TEXT NOT NULL,
    "organisation_type" INTEGER NOT NULL,
    "telephone_number" TEXT NOT NULL,
    "stripe_subscription_id" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallet_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("external_id")
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

-- CreateTable
CREATE TABLE "FailedPaymentAttempt" (
    "id" SERIAL NOT NULL,
    "external_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payment_intent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedPaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_external_id_key" ON "Wallet"("external_id");

-- CreateIndex
CREATE INDEX "KycToken_email_idx" ON "KycToken"("email");

-- CreateIndex
CREATE INDEX "KycToken_token_idx" ON "KycToken"("token");

-- CreateIndex
CREATE INDEX "KycToken_session_id_idx" ON "KycToken"("session_id");

-- CreateIndex
CREATE INDEX "Subscription_customer_email_idx" ON "Subscription"("customer_email");

-- CreateIndex
CREATE INDEX "CompanyMember_id_idx" ON "CompanyMember"("id");

-- CreateIndex
CREATE INDEX "ScannedMail_id_idx" ON "ScannedMail"("id");

-- CreateIndex
CREATE INDEX "ScannedMail_external_id_idx" ON "ScannedMail"("external_id");

-- CreateIndex
CREATE INDEX "FailedPaymentAttempt_external_id_idx" ON "FailedPaymentAttempt"("external_id");

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("external_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannedMail" ADD CONSTRAINT "ScannedMail_external_id_fkey" FOREIGN KEY ("external_id") REFERENCES "Subscription"("external_id") ON DELETE RESTRICT ON UPDATE CASCADE;
