import { useTranslation } from 'react-i18next';
import { Button } from './Button.tsx';

export function PrintButton() {
  const { t } = useTranslation();

  return (
    <Button
      variant="secondary"
      fullWidth={false}
      className="print:hidden"
      onClick={() => window.print()}
    >
      {t('report.print')}
    </Button>
  );
}
