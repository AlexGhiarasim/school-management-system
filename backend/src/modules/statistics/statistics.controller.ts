import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { StatisticsQueryDto } from './dto/statistics-query.dto.js';
import { StatisticsService } from './statistics.service.js';

@ApiTags('Statistics')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({
    summary: 'Averages, grade distribution and students at risk',
    description:
      'Covers the whole school, or one class when classId is given. A student is at risk when the rounded average of a subject is below 5.',
  })
  getOverview(@Query() query: StatisticsQueryDto) {
    return this.statisticsService.getOverview(query);
  }
}
