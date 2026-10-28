// Letters and digits without the ones that are easy to mix up (0/O, 1/l/I).
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const LENGTH = 12;
const DIGIT_COUNT = 3;

function randomBelow(limit: number): number {
  const [random] = crypto.getRandomValues(new Uint32Array(1));

  return random % limit;
}

function pick(characters: string): string {
  return characters[randomBelow(characters.length)];
}

// A random password that follows the rules: at least one letter and one digit.
export function generatePassword(): string {
  const characters = [
    ...Array.from({ length: DIGIT_COUNT }, () => pick(DIGITS)),
    ...Array.from({ length: LENGTH - DIGIT_COUNT }, () => pick(LETTERS)),
  ];

  // Shuffle, so the digits are not always at the start.
  for (let index = characters.length - 1; index > 0; index--) {
    const other = randomBelow(index + 1);
    [characters[index], characters[other]] = [
      characters[other],
      characters[index],
    ];
  }

  return characters.join('');
}
