import { useTranslation } from 'react-i18next';

// Translates the subjects that ship with the seed data and keeps the stored
// name for any subject an administrator adds.
export function useSubjectName() {
  const { t } = useTranslation();

  return (name: string) => t(`subjectNames.${name}`, { defaultValue: name });
}
