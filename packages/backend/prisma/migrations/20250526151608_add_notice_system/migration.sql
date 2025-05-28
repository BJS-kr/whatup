-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('CHANGE_REQUEST', 'CONTENT_ACCEPTED', 'CONTENT_REJECTED');

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NoticeType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "threadId" TEXT,
    "contentId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
