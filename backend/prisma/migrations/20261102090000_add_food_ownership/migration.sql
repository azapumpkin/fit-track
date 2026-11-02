-- Existing products remain system-owned (ownerId IS NULL). This preserves all
-- rows and their FoodEntry references while making ownership additive.
ALTER TABLE "Food" ADD COLUMN "ownerId" INTEGER;

CREATE INDEX "Food_ownerId_idx" ON "Food"("ownerId");

ALTER TABLE "Food"
ADD CONSTRAINT "Food_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
