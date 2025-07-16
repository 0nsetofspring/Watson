/*
  Warnings:

  - You are about to drop the column `isInInspectation` on the `InteractiveObject` table. All the data in the column will be lost.
  - You are about to drop the column `remainingQuestions` on the `InteractiveObject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InteractiveObject" DROP COLUMN "isInInspectation",
DROP COLUMN "remainingQuestions";

-- CreateTable
CREATE TABLE "PlaythroughObjectState" (
    "id" SERIAL NOT NULL,
    "playthroughId" INTEGER NOT NULL,
    "interactiveObjectId" INTEGER NOT NULL,
    "isInInspectation" BOOLEAN NOT NULL DEFAULT false,
    "remainingQuestions" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlaythroughObjectState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaythroughObjectState_playthroughId_interactiveObjectId_key" ON "PlaythroughObjectState"("playthroughId", "interactiveObjectId");

-- AddForeignKey
ALTER TABLE "PlaythroughObjectState" ADD CONSTRAINT "PlaythroughObjectState_playthroughId_fkey" FOREIGN KEY ("playthroughId") REFERENCES "Playthrough"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaythroughObjectState" ADD CONSTRAINT "PlaythroughObjectState_interactiveObjectId_fkey" FOREIGN KEY ("interactiveObjectId") REFERENCES "InteractiveObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
