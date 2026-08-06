import { createContext, useContext, useEffect, useMemo } from "react";

type StudyTheme = "dark";

type ThemeContextValue = {
  theme: StudyTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }) => {
  const theme: StudyTheme = "dark";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("aiq-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {},
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
