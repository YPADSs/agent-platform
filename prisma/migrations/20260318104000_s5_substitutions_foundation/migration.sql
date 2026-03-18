-- CreateTable
CREATE TABLE "IngredientSubstitutionRule" (
    "id" TEXT NOT NULL,
    "sourceIngredientId" TEXT,
    "sourceCategoryKey" TEXT,
    "substituteIngredientId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientSubstitutionRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IngredientSubstitutionRule_sourceIngredientId_isActive_sortOrder_idx"
ON "IngredientSubstitutionRule"("sourceIngredientId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "IngredientSubstitutionRule_sourceCategoryKey_isActive_sortOrder_idx"
ON "IngredientSubstitutionRule"("sourceCategoryKey", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "IngredientSubstitutionRule_substituteIngredientId_idx"
ON "IngredientSubstitutionRule"("substituteIngredientId");

-- CreateIndex
CREATE INDEX "IngredientSubstitutionRule_isActive_sortOrder_idx"
ON "IngredientSubstitutionRule"("isActive", "sortOrder");

-- AddForeignKey
ALTER TABLE "IngredientSubstitutionRule"
ADD CONSTRAINT "IngredientSubstitutionRule_sourceIngredientId_fkey"
FOREIGN KEY ("sourceIngredientId") REFERENCES "IngredientCatalog"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientSubstitutionRule"
ADD CONSTRAINT "IngredientSubstitutionRule_substituteIngredientId_fkey"
FOREIGN KEY ("substituteIngredientId") REFERENCES "IngredientCatalog"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
