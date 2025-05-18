/*
  Warnings:

  - You are about to drop the column `kind` on the `threads` table. All the data in the column will be lost.
  - Added the required column `description` to the `threads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxLength` to the `threads` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "thread_contents" ADD COLUMN     "parentContentId" TEXT,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "threads" DROP COLUMN "kind",
ADD COLUMN     "autoAccept" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "maxLength" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "thread_contents" ADD CONSTRAINT "thread_contents_parentContentId_fkey" FOREIGN KEY ("parentContentId") REFERENCES "thread_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
