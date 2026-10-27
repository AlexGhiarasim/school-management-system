import type { ReactNode } from 'react';

interface ProfileBannerProps {
  initials: string;
  name: string;
  subtitle: string;
  children?: ReactNode;
}

// Top of a profile card: a soft band with the avatar resting on its edge and
// the name below it.
export function ProfileBanner({
  initials,
  name,
  subtitle,
  children,
}: ProfileBannerProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div
        aria-hidden="true"
        className="h-24 bg-[radial-gradient(circle_at_85%_20%,rgb(224_242_254),transparent_55%),linear-gradient(to_right,rgb(224_231_255),rgb(238_242_255))]"
      />
      <div className="px-6 pb-6">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="-mt-9 flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700 shadow-md ring-4 ring-white"
          >
            {initials}
          </span>
          <div className="min-w-0 pt-3">
            <p className="truncate text-xl font-semibold tracking-tight text-slate-900">
              {name}
            </p>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
