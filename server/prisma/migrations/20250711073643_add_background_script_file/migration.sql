/*
  Warnings:

  - Added the required column `backgroundScript` to the `Scenario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "backgroundScript" TEXT NOT NULL;
