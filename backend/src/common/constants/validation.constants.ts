export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const NAME_PATTERN = /^\p{L}[\p{L} '.-]*$/u;

export const EMAIL_MAX_LENGTH = 255;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_PATTERN = /^(?=.*\p{L})(?=.*\d).+$/u;

export const MIN_BIRTH_DATE = new Date('1900-01-01');
