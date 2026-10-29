import type { SVGProps } from 'react';

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
      {...props}
    />
  );
}

export function EyeIcon() {
  return (
    <Icon>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon() {
  return (
    <Icon>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.3 3.9" />
      <path d="M6.6 6.7C3.8 8.5 2 12 2 12s3.6 6 10 6a9.9 9.9 0 0 0 4.4-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Icon>
  );
}

export function CheckIcon() {
  return (
    <Icon strokeWidth={2.4}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  );
}

export function SpinnerIcon() {
  return (
    <Icon className="h-5 w-5 animate-spin" strokeWidth={3}>
      <path d="M12 3a9 9 0 1 0 9 9" opacity="0.9" />
    </Icon>
  );
}

export function AlertIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5" />
      <path d="M12 16h.01" />
    </Icon>
  );
}

export function CloseIcon() {
  return (
    <Icon>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Icon>
  );
}

export function InboxIcon() {
  return (
    <Icon>
      <path d="M4 13l2.5-7h11L20 13" />
      <path d="M4 13v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5h-5a3 3 0 0 1-6 0H4Z" />
    </Icon>
  );
}

export function ChevronDownIcon() {
  return (
    <Icon className="h-4 w-4" strokeWidth={2.4}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function MenuIcon() {
  return (
    <Icon>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Icon>
  );
}

export function InfoIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </Icon>
  );
}
