import { createContext, useContext, useEffect, useMemo, useState } from "react";

type StudyTheme = "dark" | "light";

type ThemeContextValue = {
  theme: StudyTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<StudyTheme>(() => {
    const savedTheme = localStorage.getItem("aiq-theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("aiq-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useStudyTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useStudyTheme must be used inside ThemeProvider");
  }
  return context;
};
