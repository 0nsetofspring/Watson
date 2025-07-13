/*
  Warnings:

  - You are about to drop the column `scenarioId` on the `Npc` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Npc" DROP CONSTRAINT "Npc_scenarioId_fkey";

-- AlterTable
ALTER TABLE "ChatLog" ADD COLUMN     "interactiveObjectId" INTEGER;

-- AlterTable
ALTER TABLE "Npc" DROP COLUMN "scenarioId",
ADD COLUMN     "roomId" INTEGER;

-- AlterTable
ALTER TABLE "Playthrough" ADD COLUMN     "playTimeInSeconds" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "backgroundImageUrl" TEXT,
    "scenarioId" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteractiveObject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "x" TEXT NOT NULL,
    "y" TEXT NOT NULL,
    "width" TEXT,
    "height" TEXT,
    "icon" TEXT,
    "isClickable" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "data" TEXT,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "InteractiveObject_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractiveObject" ADD CONSTRAINT "InteractiveObject_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Npc" ADD CONSTRAINT "Npc_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatLog" ADD CONSTRAINT "ChatLog_interactiveObjectId_fkey" FOREIGN KEY ("interactiveObjectId") REFERENCES "InteractiveObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
