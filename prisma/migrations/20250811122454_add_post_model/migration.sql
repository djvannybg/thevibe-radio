/*
  Warnings:

  - You are about to drop the column `contentMdx` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `coverPath` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `excerpt` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `ogImagePath` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `seoDescription` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `post` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `post` DROP COLUMN `contentMdx`,
    DROP COLUMN `coverPath`,
    DROP COLUMN `excerpt`,
    DROP COLUMN `ogImagePath`,
    DROP COLUMN `publishedAt`,
    DROP COLUMN `seoDescription`,
    DROP COLUMN `tags`,
    ADD COLUMN `authorId` VARCHAR(191) NOT NULL,
    ADD COLUMN `content` VARCHAR(191) NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `seoDesc` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
