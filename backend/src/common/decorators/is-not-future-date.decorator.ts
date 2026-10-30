import { registerDecorator, type ValidationOptions } from 'class-validator';

const ONE_DAY = 24 * 60 * 60 * 1000;

// A date up to one day ahead is accepted, because the user's day may already
// be the next one in UTC.
export function IsNotFutureDate(options?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isNotFutureDate',
      target: target.constructor,
      propertyName,
      options: {
        message: `${propertyName} cannot be in the future`,
        ...options,
      },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;

          const date = new Date(value);
          return (
            !Number.isNaN(date.getTime()) &&
            date.getTime() <= Date.now() + ONE_DAY
          );
        },
      },
    });
  };
}
