-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "product_id" TEXT,
    "customer_first_name" TEXT,
    "customer_middle_name" TEXT,
    "customer_last_name" TEXT,
    "customer_email" TEXT NOT NULL,
    "review_status" TEXT NOT NULL,
    "shipping_line_1" TEXT,
    "shipping_line_2" TEXT,
    "shipping_line_3" TEXT,
    "shipping_city" TEXT,
    "shipping_postcode" TEXT,
    "shipping_state" TEXT,
    "shipping_country" TEXT,
    "company_name" TEXT,
    "company_trading_name" TEXT,
    "company_number" TEXT,
    "organisation_type" TEXT,
    "telephone_number" TEXT,
    "stripe_subscription_id" TEXT,
    "start_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_external_id_key" ON "Subscription"("external_id");
