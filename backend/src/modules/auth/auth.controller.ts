import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';
import { AuthService } from './auth.service.js';
import { AuthConfigDto } from './dto/auth-config.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CurrentUserDto } from './dto/current-user.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Tell the client which sign-up options are open' })
  @ApiOkResponse({ type: AuthConfigDto })
  getConfig(): AuthConfigDto {
    return { registrationEnabled: this.authService.isRegistrationEnabled() };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({
    summary: 'Create a student account and sign in',
    description:
      'Disabled by default. Set ALLOW_PUBLIC_REGISTRATION=true to enable it.',
  })
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiForbiddenResponse({ description: 'Public registration is disabled' })
  @ApiConflictResponse({ description: 'Email is already registered' })
  register(@Body() dto: RegisterDto): Promise<LoginResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Email a password reset link',
    description:
      'Always answers 204, whether or not the email belongs to an account.',
  })
  @ApiNoContentResponse()
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Choose a new password with a reset link token' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ description: 'The link is invalid or has expired' })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change the password of the authenticated user',
    description: 'Signs out the other sessions and returns a fresh token.',
  })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiForbiddenResponse({ description: 'The current password is incorrect' })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<LoginResponseDto> {
    return this.authService.changePassword(user, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user and profile' })
  @ApiOkResponse({ type: CurrentUserDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<CurrentUserDto> {
    return this.authService.getCurrentUser(user);
  }
}
