-- CreateEnum
CREATE TYPE "PantryItemSource" AS ENUM ('MANUAL', 'SHOPPING_LIST', 'PLANNER');

-- CreateTable
CREATE TABLE "IngredientCatalog" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "defaultName" TEXT NOT NULL,
    "categoryKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PantryItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2),
    "unit" TEXT,
    "source" "PantryItemSource" NOT NULL DEFAULT 'MANUAL',
    "sourceRefId" TEXT,
    "displayName" TEXT,
    "note" TEXT,
    "lastConfirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngredientCatalog_key_key" ON "IngredientCatalog"("key");

-- CreateIndex
CREATE INDEX "IngredientCatalog_categoryKey_idx" ON "IngredientCatalog"("categoryKey");

-- CreateIndex
CREATE UNIQUE INDEX "PantryItem_userId_ingredientId_key" ON "PantryItem"("userId", "ingredientId");

-- CreateIndex
CREATE INDEX "PantryItem_userId_updatedAt_idx" ON "PantryItem"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "PantryItem_ingredientId_idx" ON "PantryItem"("ingredientId");

-- CreateIndex
CREATE INDEX "PantryItem_source_sourceRefId_idx" ON "PantryItem"("source", "sourceRefId");

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_ingredientId_fkey"
FOREIGN KEY ("ingredientId") REFERENCES "IngredientCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
