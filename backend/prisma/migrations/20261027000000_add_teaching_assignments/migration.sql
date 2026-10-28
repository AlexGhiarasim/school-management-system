-- CreateTable
CREATE TABLE `TeachingAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teacherId` INTEGER NOT NULL,
    `classId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,

    INDEX `TeachingAssignment_classId_idx`(`classId`),
    INDEX `TeachingAssignment_subjectId_idx`(`subjectId`),
    UNIQUE INDEX `TeachingAssignment_teacherId_classId_subjectId_key`(`teacherId`, `classId`, `subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TeachingAssignment` ADD CONSTRAINT `TeachingAssignment_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeachingAssignment` ADD CONSTRAINT `TeachingAssignment_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeachingAssignment` ADD CONSTRAINT `TeachingAssignment_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

