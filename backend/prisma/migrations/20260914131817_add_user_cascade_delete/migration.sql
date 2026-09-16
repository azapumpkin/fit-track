-- DropForeignKey
ALTER TABLE "FoodEntry" DROP CONSTRAINT "FoodEntry_userId_fkey";

-- AddForeignKey
ALTER TABLE "FoodEntry" ADD CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
