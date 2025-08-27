/*
  Warnings:

  - The primary key for the `NowPlayingCache` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Artist` on the `NowPlayingCache` table. All the data in the column will be lost.
  - You are about to drop the column `fetchedAt` on the `NowPlayingCache` table. All the data in the column will be lost.
  - You are about to drop the column `listeners` on the `NowPlayingCache` table. All the data in the column will be lost.
  - You are about to drop the column `station` on the `NowPlayingCache` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `NowPlayingCache` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `NowPlayingCache` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `updatedAt` to the `NowPlayingCache` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `NowPlayingCache_station_fetchedAt_idx` ON `NowPlayingCache`;

-- AlterTable
ALTER TABLE `NowPlayingCache` DROP PRIMARY KEY,
    DROP COLUMN `Artist`,
    DROP COLUMN `fetchedAt`,
    DROP COLUMN `listeners`,
    DROP COLUMN `station`,
    DROP COLUMN `title`,
    ADD COLUMN `trackId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `id` INTEGER NOT NULL DEFAULT 1,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `NowPlayingCache` ADD CONSTRAINT `NowPlayingCache_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
