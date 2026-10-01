import React, { useEffect, useState } from 'react';
import { MeaningLanguage } from '../types/vocab';
import { getMeaning } from '../utils/meanings';

interface MeaningTextProps {
  word: string;
  nepali: string;
  language: MeaningLanguage;
  className?: string;
}

export const MeaningText: React.FC<MeaningTextProps> = ({
  word,
  nepali,
  language,
  className,
}) => {
  const [meaning, setMeaning] = useState(language === 'ne' ? nepali : '...');

  useEffect(() => {
    let active = true;
    setMeaning(language === 'ne' ? nepali : '...');
    if (language !== 'ne') {
      getMeaning(word, nepali, language)
        .then((value) => {
          if (active) setMeaning(value);
        })
        .catch(() => {
          if (active) setMeaning('Translation unavailable');
        });
    }
    return () => {
      active = false;
    };
  }, [word, nepali, language]);

  return <span className={className}>{meaning}</span>;
};