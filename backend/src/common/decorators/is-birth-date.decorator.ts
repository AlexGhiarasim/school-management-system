import { registerDecorator, type ValidationOptions } from 'class-validator';
import { MIN_BIRTH_DATE } from '../constants/validation.constants.js';

export function IsBirthDate(options?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isBirthDate',
      target: target.constructor,
      propertyName,
      options: {
        message:
          'dateOfBirth must be a valid date between 1900-01-01 and today',
        ...options,
      },
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;

          const date = new Date(value);
          return (
            !Number.isNaN(date.getTime()) &&
            date >= MIN_BIRTH_DATE &&
            date <= new Date()
          );
        },
      },
    });
  };
}
