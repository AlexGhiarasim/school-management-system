import { Module } from '@nestjs/common';
import { GradeAuditService } from './grade-audit.service.js';
import { GradesController } from './grades.controller.js';
import { GradesService } from './grades.service.js';

@Module({
  controllers: [GradesController],
  providers: [GradesService, GradeAuditService],
})
export class GradesModule {}
