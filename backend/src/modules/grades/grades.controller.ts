import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { Role } from '../../generated/prisma/enums.js';
import { CreateGradeDto } from './dto/create-grade.dto.js';
import { ExportGradesQueryDto } from './dto/export-grades-query.dto.js';
import { ListGradeHistoryQueryDto } from './dto/list-grade-history-query.dto.js';
import { ListGradesQueryDto } from './dto/list-grades-query.dto.js';
import { UpdateGradeDto } from './dto/update-grade.dto.js';
import { GradeAuditService } from './grade-audit.service.js';
import { GradesService } from './grades.service.js';

@ApiTags('Grades')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.TEACHER)
@Controller('grades')
export class GradesController {
  constructor(
    private readonly gradesService: GradesService,
    private readonly gradeAuditService: GradeAuditService,
  ) {}

  @Get('me')
  @Roles(Role.STUDENT)
  findOwn(@CurrentUser() user: AuthenticatedUser) {
    if (user.studentId === null) {
      throw new ForbiddenException();
    }

    return this.gradesService.findOwn(user);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="grades.csv"')
  @ApiOperation({
    summary: 'Download the filtered grades as a CSV file',
    description:
      'Administrators export any grades. A class teacher exports the grades of their class, with classId.',
  })
  @ApiProduces('text/csv')
  exportCsv(
    @Query() query: ExportGradesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.gradesService.exportCsv(query, user);
  }

  @Get('history')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List every change made to grades, newest first' })
  findHistory(@Query() query: ListGradeHistoryQueryDto) {
    return this.gradeAuditService.findAll(query);
  }

  @Get(':id/history')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List the changes made to one grade' })
  findGradeHistory(@Param('id', ParseIntPipe) id: number) {
    return this.gradeAuditService.findForGrade(id);
  }

  @Get()
  findAll(
    @Query() query: ListGradesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.gradesService.findAll(query, user);
  }

  @Post()
  create(@Body() dto: CreateGradeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.gradesService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGradeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.gradesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.gradesService.remove(id, user);
  }
}
