import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { Role } from '../../generated/prisma/enums.js';
import { ClassesService } from './classes.service.js';
import { AssignTeacherDto } from './dto/assign-teacher.dto.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { ListClassesQueryDto } from './dto/list-classes-query.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';

@ApiTags('Classes')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  findAll(@Query() query: ListClassesQueryDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.remove(id);
  }

  @Patch(':id/teacher')
  assignTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignTeacherDto,
  ) {
    return this.classesService.assignTeacher(id, dto.teacherId);
  }

  @Get(':id/teaching')
  @Roles(Role.ADMIN, Role.TEACHER)
  findTeaching(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classesService.findTeaching(id, user);
  }

  @Get(':id/overview')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({
    summary: 'Statistics, students and teachers of a class',
    description: 'For the class teacher of the class, or an administrator.',
  })
  findOverview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classesService.findOverview(id, user);
  }

  @Get(':id/students')
  @Roles(Role.ADMIN, Role.TEACHER)
  findStudents(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classesService.findStudents(id, query, user);
  }
}
