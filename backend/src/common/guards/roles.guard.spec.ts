import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/enums.js';
import { RolesGuard } from './roles.guard.js';

function createContext(user: { role: Role } | undefined) {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);
  const requireRoles = (roles: Role[] | undefined) =>
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);

  it('allows any authenticated user when no roles are required', () => {
    requireRoles(undefined);
    expect(guard.canActivate(createContext({ role: Role.STUDENT }))).toBe(true);
  });

  it('allows a user whose role is required', () => {
    requireRoles([Role.ADMIN, Role.TEACHER]);
    expect(guard.canActivate(createContext({ role: Role.TEACHER }))).toBe(true);
  });

  it('rejects a user whose role is not required', () => {
    requireRoles([Role.ADMIN]);
    expect(guard.canActivate(createContext({ role: Role.STUDENT }))).toBe(
      false,
    );
  });

  it('rejects a request without a user', () => {
    requireRoles([Role.ADMIN]);
    expect(guard.canActivate(createContext(undefined))).toBe(false);
  });
});
