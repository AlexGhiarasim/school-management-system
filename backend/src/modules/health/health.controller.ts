import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { Public } from '../../common/decorators/public.decorator.js';
import { PrismaService } from '../../database/prisma.service.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicator: HealthIndicatorService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check that the API and the database are up' })
  check() {
    return this.health.check([
      () =>
        this.indicator.check('database').attempt(async () => {
          // The answer is public, so it must not carry the driver's error.
          await this.prisma.$queryRaw`SELECT 1`.catch(() => {
            throw new Error('The database is not reachable');
          });
        }),
    ]);
  }
}
