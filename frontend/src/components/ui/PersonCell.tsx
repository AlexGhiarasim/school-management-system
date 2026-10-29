// A name with the email underneath. The email moves to a column of its own once
// the table is wide enough, so it is hidden here from that width on.
const HIDE_EMAIL = {
  '2xl': '@2xl:hidden',
  '4xl': '@4xl:hidden',
};

interface PersonCellProps {
  name: string;
  email: string;
  hideEmailFrom: keyof typeof HIDE_EMAIL;
}

export function PersonCell({ name, email, hideEmailFrom }: PersonCellProps) {
  return (
    <>
      <span className="font-medium text-slate-900">{name}</span>
      <span
        className={`block text-sm font-normal text-slate-500 ${HIDE_EMAIL[hideEmailFrom]}`}
      >
        {email}
      </span>
    </>
  );
}
