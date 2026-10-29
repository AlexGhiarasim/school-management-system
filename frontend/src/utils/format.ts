export function formatDate(value: string, language: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatNumber(value: number, language: string): string {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatShortDate(value: string, language: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateTime(value: string, language: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

interface PersonName {
  firstName: string;
  lastName: string;
}

// People are written with the family name first, like "Munteanu Diana".
export function fullName({ firstName, lastName }: PersonName): string {
  return `${lastName} ${firstName}`;
}

export function initials({ firstName, lastName }: PersonName): string {
  return `${lastName[0]}${firstName[0]}`;
}
