-- CreateTable
CREATE TABLE `GradeAudit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gradeId` INTEGER NOT NULL,
    `action` ENUM('CREATED', 'UPDATED', 'DELETED') NOT NULL,
    `actorId` INTEGER NULL,
    `studentId` INTEGER NULL,
    `studentName` VARCHAR(191) NOT NULL,
    `subjectName` VARCHAR(191) NOT NULL,
    `previousSubjectName` VARCHAR(191) NULL,
    `oldValue` INTEGER NULL,
    `newValue` INTEGER NULL,
    `oldDate` DATE NULL,
    `newDate` DATE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GradeAudit_gradeId_idx`(`gradeId`),
    INDEX `GradeAudit_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GradeAudit` ADD CONSTRAINT `GradeAudit_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GradeAudit` ADD CONSTRAINT `GradeAudit_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
