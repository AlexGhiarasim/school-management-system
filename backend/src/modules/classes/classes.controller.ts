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
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { Role } from '../../generated/prisma/enums.js';
import { ClassesService } from './classes.service.js';
import { AssignTeachingDto } from './dto/assign-teaching.dto.js';
import { AssignTeacherDto } from './dto/assign-teacher.dto.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { ListClassesQueryDto } from './dto/list-classes-query.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';

@ApiTags('Classes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@ApiForbiddenResponse({ description: 'The role may not do this' })
@Roles(Role.ADMIN)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @ApiOperation({ summary: 'List classes' })
  findAll(@Query() query: ListClassesQueryDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one class' })
  @ApiNotFoundResponse({ description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a class' })
  @ApiConflictResponse({ description: 'The name or email is already used' })
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename a class' })
  @ApiNotFoundResponse({ description: 'Not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a class, its students stay without a class',
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.remove(id);
  }

  @Patch(':id/teacher')
  @ApiOperation({
    summary: 'Choose the class teacher, or remove them with a null teacher',
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  assignTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignTeacherDto,
  ) {
    return this.classesService.assignTeacher(id, dto.teacherId);
  }

  @Get(':id/teaching')
  @ApiOperation({ summary: 'Who teaches which subject in the class' })
  findTeaching(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findTeaching(id);
  }

  @Post(':id/teaching')
  @ApiOperation({
    summary: 'Let a teacher teach a subject in the class',
    description:
      'The teacher can then grade the students of the class in that subject. A subject has one teacher in a class.',
  })
  addTeaching(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignTeachingDto,
  ) {
    return this.classesService.addTeaching(id, dto);
  }

  @Delete(':id/teaching/:assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Stop a teacher teaching a subject in the class' })
  removeTeaching(
    @Param('id', ParseIntPipe) id: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ) {
    return this.classesService.removeTeaching(id, assignmentId);
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
  @ApiOperation({
    summary:
      'List the students of a class. A teacher sees only the classes where they teach',
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  findStudents(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.classesService.findStudents(id, query, user);
  }
}
