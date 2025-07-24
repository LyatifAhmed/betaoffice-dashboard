-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "balance_pennies" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_external_id_key" ON "Wallet"("external_id");
