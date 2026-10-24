import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { Role } from '../../generated/prisma/enums.js';
import { CreateGradeDto } from './dto/create-grade.dto.js';
import { ListGradesQueryDto } from './dto/list-grades-query.dto.js';
import { UpdateGradeDto } from './dto/update-grade.dto.js';
import { GradesService } from './grades.service.js';

@ApiTags('Grades')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.TEACHER)
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('me')
  @Roles(Role.STUDENT)
  findOwn(@CurrentUser() user: AuthenticatedUser) {
    if (user.studentId === null) {
      throw new ForbiddenException();
    }

    return this.gradesService.findOwn(user);
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradesService.remove(id);
  }
}
