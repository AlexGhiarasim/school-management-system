import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const WORD_MS = 2600;

export function RotatingHeadline() {
  const { t } = useTranslation();
  const words = t('landing.words', { returnObjects: true }) as string[];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduceMotion) return;

    const timer = window.setInterval(
      () => setIndex((current) => current + 1),
      WORD_MS,
    );

    return () => window.clearInterval(timer);
  }, []);

  const word = words[index % words.length];

  return (
    <h1 className="max-w-lg text-4xl leading-tight font-bold tracking-tight text-slate-900 sm:text-5xl">
      {t('landing.headline')}{' '}
      <button
        type="button"
        onClick={() => setIndex((current) => current + 1)}
        className="inline-grid cursor-pointer text-left text-indigo-600"
      >
        <span className="sr-only">{word}.</span>
        {words.map((item) => (
          <span
            key={`${item}-${item === word}`}
            aria-hidden="true"
            className={`col-start-1 row-start-1 ${
              item === word ? 'animate-fade-in' : 'invisible'
            }`}
          >
            {item}.
          </span>
        ))}
      </button>
    </h1>
  );
}
