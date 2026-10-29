import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

const LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
const DIGITS = '23456789';

function pick(characters: string): string {
  return characters[randomInt(characters.length)];
}

// A random password that is easy to read out: no 0/O or 1/l/I. It always has
// a letter and a digit, as the password rules ask.
export function generatePassword(length = 12): string {
  const characters = [
    pick(LETTERS),
    pick(DIGITS),
    ...Array.from({ length: length - 2 }, () => pick(LETTERS + DIGITS)),
  ];

  for (let index = characters.length - 1; index > 0; index--) {
    const other = randomInt(index + 1);
    [characters[index], characters[other]] = [
      characters[other],
      characters[index],
    ];
  }

  return characters.join('');
}
