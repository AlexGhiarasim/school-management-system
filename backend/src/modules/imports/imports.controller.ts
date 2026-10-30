import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { ImportFileDto } from './dto/import-file.dto.js';
import { ImportTemplateQueryDto } from './dto/import-template-query.dto.js';
import { IMPORT_KINDS, type ImportKind } from './import.types.js';
import { ImportsService } from './imports.service.js';

@ApiTags('Imports')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@ApiForbiddenResponse({ description: 'The role may not do this' })
@Roles(Role.ADMIN)
@Controller('imports')
@ApiParam({ name: 'kind', enum: IMPORT_KINDS })
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get(':kind/template')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOperation({ summary: 'Download a CSV file to fill in' })
  @ApiProduces('text/csv')
  template(
    @Param('kind', new ParseEnumPipe(IMPORT_KINDS)) kind: ImportKind,
    @Query() { language }: ImportTemplateQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${kind}-template.csv"`,
    );

    return this.importsService.template(kind, language);
  }

  @Post(':kind/preview')
  @ApiOperation({
    summary: 'Check a CSV file and show what would be imported',
    description: 'Saves nothing. Every row comes back with its errors, if any.',
  })
  preview(
    @Param('kind', new ParseEnumPipe(IMPORT_KINDS)) kind: ImportKind,
    @Body() { content }: ImportFileDto,
  ) {
    return this.importsService.preview(kind, content);
  }

  @Post(':kind')
  @ApiOperation({
    summary: 'Import the valid rows of a CSV file',
    description:
      'The rows with errors are skipped. For the accounts whose password was not in the file, the generated password is returned once.',
  })
  commit(
    @Param('kind', new ParseEnumPipe(IMPORT_KINDS)) kind: ImportKind,
    @Body() { content }: ImportFileDto,
  ) {
    return this.importsService.commit(kind, content);
  }
}
