import { createContext, useContext, useEffect, useMemo, useState } from "react";

const presets = {
  classic: { label: "Classic", primary: "#8B5CF6", secondary: "#EC4899" },
  aurora: { label: "Aurora", primary: "#7C3AED", secondary: "#06B6D4" },
  sunset: { label: "Sunset", primary: "#F97316", secondary: "#EC4899" },
  contrast: { label: "Contrast", primary: "#0F172A", secondary: "#F43F5E" }
};

const backgrounds = {
  dawn: {
    label: "Dawn",
    accent1: "rgba(139, 92, 246, 0.14)",
    accent2: "rgba(236, 72, 153, 0.12)",
    accent3: "rgba(59, 130, 246, 0.08)"
  },
  aurora: {
    label: "Aurora",
    accent1: "rgba(34, 197, 94, 0.14)",
    accent2: "rgba(59, 130, 246, 0.12)",
    accent3: "rgba(168, 85, 247, 0.10)"
  },
  sunset: {
    label: "Sunset",
    accent1: "rgba(249, 115, 22, 0.18)",
    accent2: "rgba(236, 72, 153, 0.14)",
    accent3: "rgba(245, 158, 11, 0.10)"
  },
  midnight: {
    label: "Midnight",
    accent1: "rgba(59, 130, 246, 0.16)",
    accent2: "rgba(139, 92, 246, 0.12)",
    accent3: "rgba(15, 23, 42, 0.22)"
  }
};

const fonts = {
  inter: { label: "Inter", value: '"Inter", sans-serif' },
  system: { label: "System", value: 'system-ui, sans-serif' },
  serif: { label: "Serif", value: 'Georgia, serif' },
  mono: { label: "Mono", value: '"JetBrains Mono", monospace' }
};

const surfaceRadii = {
  compact: { label: "Compacto", value: "10px" },
  soft: { label: "Suave", value: "16px" },
  rounded: { label: "Redondo", value: "22px" }
};

const borderStyles = {
  thin: { label: "Fino", value: "1px" },
  medium: { label: "Medio", value: "2px" },
  strong: { label: "Fuerte", value: "3px" }
};

const ThemeContext = createContext(null);

const readStorage = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
};

const readCustomPalette = () => {
  try {
    const raw = localStorage.getItem("proconnect_custom_palette");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const setPaletteOnDocument = (palette) => {
  document.documentElement.style.setProperty("--color-primary", palette.primary);
  document.documentElement.style.setProperty("--color-secondary", palette.secondary);
};

const setBackgroundOnDocument = (background) => {
  document.documentElement.style.setProperty("--bg-accent-1", background.accent1);
  document.documentElement.style.setProperty("--bg-accent-2", background.accent2);
  document.documentElement.style.setProperty("--bg-accent-3", background.accent3);
};

const setFontOnDocument = (fontValue) => {
  document.documentElement.style.setProperty("--app-font-family", fontValue);
};

const setSurfaceRadiusOnDocument = (radiusValue) => {
  document.documentElement.style.setProperty("--surface-radius", radiusValue);
};

const setBorderWidthOnDocument = (borderValue) => {
  document.documentElement.style.setProperty("--surface-border-width", borderValue);
};

export const ThemeProvider = ({ children }) => {
  const [customPalette, setCustomPalette] = useState(() => readCustomPalette());
  const [themeName, setThemeName] = useState(() => readStorage("proconnect_theme", customPalette ? "custom" : "classic"));
  const [backgroundName, setBackgroundName] = useState(() => readStorage("proconnect_background", "dawn"));
  const [isDarkMode, setIsDarkMode] = useState(() => readStorage("proconnect_dark", "false") === "true");
  const [fontName, setFontName] = useState(() => readStorage("proconnect_font", "inter"));
  const [surfaceRadiusName, setSurfaceRadiusName] = useState(() => readStorage("proconnect_radius", "soft"));
  const [borderStyleName, setBorderStyleName] = useState(() => readStorage("proconnect_border", "thin"));

  const applyTheme = (name) => {
    const nextPalette = name === "custom" && customPalette ? customPalette : presets[name] || presets.classic;
    setPaletteOnDocument(nextPalette);
    setThemeName(name);
    try {
      localStorage.setItem("proconnect_theme", name);
    } catch (error) {}
  };

  const applyCustomColors = (primary, secondary) => {
    const nextPalette = { primary, secondary };
    setCustomPalette(nextPalette);
    setPaletteOnDocument(nextPalette);
    setThemeName("custom");
    try {
      localStorage.setItem("proconnect_theme", "custom");
      localStorage.setItem("proconnect_custom_palette", JSON.stringify(nextPalette));
    } catch (error) {}
  };

  const applyBackground = (name) => {
    const nextBackground = backgrounds[name] || backgrounds.dawn;
    setBackgroundOnDocument(nextBackground);
    setBackgroundName(name);
    try {
      localStorage.setItem("proconnect_background", name);
    } catch (error) {}
  };

  const toggleDarkMode = () => {
    setIsDarkMode((current) => {
      const nextValue = !current;
      try {
        localStorage.setItem("proconnect_dark", String(nextValue));
      } catch (error) {}
      return nextValue;
    });
  };

  const applyFont = (name) => {
    const nextFont = fonts[name] || fonts.inter;
    setFontOnDocument(nextFont.value);
    setFontName(name);
    try {
      localStorage.setItem("proconnect_font", name);
    } catch (error) {}
  };

  const applySurfaceRadius = (name) => {
    const nextRadius = surfaceRadii[name] || surfaceRadii.soft;
    setSurfaceRadiusOnDocument(nextRadius.value);
    setSurfaceRadiusName(name);
    try {
      localStorage.setItem("proconnect_radius", name);
    } catch (error) {}
  };

  const applyBorderStyle = (name) => {
    const nextBorder = borderStyles[name] || borderStyles.thin;
    setBorderWidthOnDocument(nextBorder.value);
    setBorderStyleName(name);
    try {
      localStorage.setItem("proconnect_border", name);
    } catch (error) {}
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const palette = themeName === "custom" && customPalette ? customPalette : presets[themeName] || presets.classic;
    setPaletteOnDocument(palette);
    setBackgroundOnDocument(backgrounds[backgroundName] || backgrounds.dawn);
    setFontOnDocument((fonts[fontName] || fonts.inter).value);
    setSurfaceRadiusOnDocument((surfaceRadii[surfaceRadiusName] || surfaceRadii.soft).value);
    setBorderWidthOnDocument((borderStyles[borderStyleName] || borderStyles.thin).value);
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const value = useMemo(
    () => ({
      themeName,
      backgroundName,
      customPalette,
      applyTheme,
      applyCustomColors,
      applyBackground,
      applyFont,
      applySurfaceRadius,
      applyBorderStyle,
      presets,
      backgrounds,
      fonts,
      surfaceRadii,
      borderStyles,
      isDarkMode,
      toggleDarkMode,
      fontName,
      surfaceRadiusName,
      borderStyleName
    }),
    [themeName, backgroundName, customPalette, isDarkMode, fontName, surfaceRadiusName, borderStyleName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);