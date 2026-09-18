ALTER TABLE "User"
ADD COLUMN "passwordHash" TEXT;

UPDATE "User"
SET "passwordHash" = "password";

ALTER TABLE "User"
ALTER COLUMN "passwordHash" SET NOT NULL;

ALTER TABLE "User"
DROP COLUMN "password";