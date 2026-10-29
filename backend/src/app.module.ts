import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RolesGuard } from './common/guards/roles.guard.js';
import { CacheModule } from './cache/cache.module.js';
import { validateEnv } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { AdminsModule } from './modules/admins/admins.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard.js';
import { SubjectsModule } from './modules/subjects/subjects.module.js';
import { TeachersModule } from './modules/teachers/teachers.module.js';
import { ClassesModule } from './modules/classes/classes.module.js';
import { GradesModule } from './modules/grades/grades.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { StatisticsModule } from './modules/statistics/statistics.module.js';
import { StudentsModule } from './modules/students/students.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    DatabaseModule,
    CacheModule,
    AuthModule,
    AdminsModule,
    HealthModule,
    SubjectsModule,
    TeachersModule,
    ClassesModule,
    StudentsModule,
    GradesModule,
    StatisticsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
