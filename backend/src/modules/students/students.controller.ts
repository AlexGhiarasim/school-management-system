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
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { Role } from '../../generated/prisma/enums.js';
import { AssignClassDto } from './dto/assign-class.dto.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { ListStudentsQueryDto } from './dto/list-students-query.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { StudentsService } from './students.service.js';

@ApiTags('Students')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@ApiForbiddenResponse({ description: 'The role may not do this' })
@Roles(Role.ADMIN)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Profile of the signed-in student' })
  findProfile(@CurrentUser() user: AuthenticatedUser) {
    if (user.studentId === null) {
      throw new ForbiddenException();
    }

    return this.studentsService.findProfile(user.studentId);
  }

  @Get('me/class')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: 'Class, class teacher and classmates of the signed-in student',
  })
  findClassOverview(@CurrentUser() user: AuthenticatedUser) {
    if (user.studentId === null) {
      throw new ForbiddenException();
    }

    return this.studentsService.findClassOverview(user.studentId);
  }

  @Get()
  @ApiOperation({ summary: 'List students, with search and class filter' })
  findAll(@Query() query: ListStudentsQueryDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one student' })
  @ApiNotFoundResponse({ description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a student and their account' })
  @ApiConflictResponse({ description: 'The name or email is already used' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student' })
  @ApiNotFoundResponse({ description: 'Not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Patch(':id/class')
  @ApiOperation({
    summary: 'Put a student in a class, or take them out with a null class',
  })
  @ApiNotFoundResponse({ description: 'Not found' })
  assignClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignClassDto,
  ) {
    return this.studentsService.assignClass(id, dto.classId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a student and their account' })
  @ApiNotFoundResponse({ description: 'Not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}
