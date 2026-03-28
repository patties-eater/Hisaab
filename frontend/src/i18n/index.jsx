import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en.json";
import ne from "./ne.json";

const LANGUAGE_KEY = "app_language";
const dictionaries = { en, ne };

const I18nContext = createContext({
  language: "en",
  setLanguage: () => {},
  applyLanguage: () => {},
  t: (key) => key,
});

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem(LANGUAGE_KEY) || "en");
  const applyLanguage = (nextLanguage) => setLanguage(nextLanguage === "ne" ? "ne" : "en");

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language === "ne" ? "ne" : "en";
  }, [language]);

  const value = useMemo(() => {
    const dictionary = dictionaries[language] || dictionaries.en;

    return {
      language,
      setLanguage: applyLanguage,
      applyLanguage,
      t: (key) => getNestedValue(dictionary, key) ?? getNestedValue(dictionaries.en, key) ?? key,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
