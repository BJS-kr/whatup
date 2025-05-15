/*
  Warnings:

  - Added the required column `service` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "service" TEXT NOT NULL;
