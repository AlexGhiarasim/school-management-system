interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-10 w-10' }: LogoProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" className="fill-indigo-600" />
      <path
        d="M20 12.5c-2.4-1.7-5.6-2.3-9-1.9v15.2c3.4-.4 6.6.2 9 1.9 2.4-1.7 5.6-2.3 9-1.9V10.6c-3.4-.4-6.6.2-9 1.9Z"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M20 12.5v15.2" stroke="white" strokeWidth="2" />
    </svg>
  );
}
