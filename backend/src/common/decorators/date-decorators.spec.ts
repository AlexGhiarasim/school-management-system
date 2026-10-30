import { validateSync } from 'class-validator';
import { IsBirthDate } from './is-birth-date.decorator.js';
import { IsNotFutureDate } from './is-not-future-date.decorator.js';

class Birth {
  @IsBirthDate()
  value: string;
}

class Past {
  @IsNotFutureDate()
  value: string;
}

const isValid = (type: new () => { value: string }, value: string) =>
  validateSync(Object.assign(new type(), { value })).length === 0;

describe('date decorators', () => {
  it('accepts a real birth date and rejects a day that does not exist', () => {
    expect(isValid(Birth, '2010-05-05')).toBe(true);
    expect(isValid(Birth, '2010-02-30')).toBe(false);
    expect(isValid(Birth, '2999-01-01')).toBe(false);
  });

  it('accepts today and rejects a date in the future', () => {
    expect(isValid(Past, new Date().toISOString().slice(0, 10))).toBe(true);
    expect(isValid(Past, '2999-01-01')).toBe(false);
  });
});
