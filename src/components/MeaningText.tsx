import React, { useEffect, useState } from 'react';
import { MeaningLanguage } from '../types/vocab';
import { getMeaning, getCachedMeaning, getMeaningFontClass } from '../utils/meanings';

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
  // Seed from the synchronous cache so previously translated words paint on the
  // first render instead of flashing a placeholder.
  const [meaning, setMeaning] = useState(() => getCachedMeaning(word, nepali, language));

  useEffect(() => {
    let active = true;
    setMeaning(getCachedMeaning(word, nepali, language));

    if (language !== 'ne') {
      getMeaning(word, nepali, language)
        .then((value) => {
          if (active) setMeaning(value);
        })
        .catch(() => {
          if (active) setMeaning(nepali);
        });
    }
    return () => {
      active = false;
    };
  }, [word, nepali, language]);

  // Font follows the selected meaning language, so CJK/Arabic/Bengali text
  // renders with the correct script instead of the Devanagari stack.
  const fontClass = getMeaningFontClass(language);

  return <span className={`${fontClass} ${className ?? ''}`}>{meaning}</span>;
};