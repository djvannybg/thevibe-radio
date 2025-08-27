/*
  Warnings:

  - A unique constraint covering the columns `[trackId]` on the table `NowPlayingCache` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Play` ADD COLUMN `ignoreReason` VARCHAR(191) NULL,
    ADD COLUMN `ignored` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `type` ENUM('MUSIC', 'JINGLE', 'AD', 'ID', 'OTHER') NOT NULL DEFAULT 'MUSIC';

-- AlterTable
ALTER TABLE `Track` ADD COLUMN `artistNorm` VARCHAR(191) NULL,
    ADD COLUMN `titleNorm` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `NowPlayingCache_trackId_key` ON `NowPlayingCache`(`trackId`);

-- CreateIndex
CREATE INDEX `Play_type_ignored_idx` ON `Play`(`type`, `ignored`);
