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
import { AssignClassDto } from './dto/assign-class.dto.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { ListStudentsQueryDto } from './dto/list-students-query.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { StudentsService } from './students.service.js';

@ApiTags('Students')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  @Roles(Role.STUDENT)
  findProfile(@CurrentUser() user: AuthenticatedUser) {
    if (user.studentId === null) {
      throw new ForbiddenException();
    }

    return this.studentsService.findProfile(user.studentId);
  }

  @Get('me/class')
  @Roles(Role.STUDENT)
  findClassOverview(@CurrentUser() user: AuthenticatedUser) {
    if (user.studentId === null) {
      throw new ForbiddenException();
    }

    return this.studentsService.findClassOverview(user.studentId);
  }

  @Get()
  findAll(@Query() query: ListStudentsQueryDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Patch(':id/class')
  assignClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignClassDto,
  ) {
    return this.studentsService.assignClass(id, dto.classId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}
