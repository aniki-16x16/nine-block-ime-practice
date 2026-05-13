import { NavigationBar } from "@capgo/capacitor-navigation-bar";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export type ThemeMode = "light" | "dark";
export type ThemePreferenceSource = "stored" | "system";

export type ThemeState = {
  mode: ThemeMode;
  source: ThemePreferenceSource;
};

export type VibrationIntensity = 0 | 1 | 2;

export type AppSettings = {
  version: 1;
  vibrationIntensity: VibrationIntensity;
};

export const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

const THEME_STORAGE_KEY = "nine-block-ime-theme-mode";
const SETTINGS_STORAGE_KEY = "nine-block-ime-settings-v1";
const THEME_COLORS = {
  dark: "#020617",
  light: "#f8fafc",
} as const;

const createDefaultSettings = (): AppSettings => ({
  version: 1,
  vibrationIntensity: 1,
});

const getStorage = () => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === "light" || value === "dark";

const isVibrationIntensity = (value: unknown): value is VibrationIntensity =>
  value === 0 || value === 1 || value === 2;

export const getSystemThemeMode = (): ThemeMode => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }

  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
};

export const loadThemeState = (): ThemeState => {
  const storedTheme = getStorage()?.getItem(THEME_STORAGE_KEY);

  if (isThemeMode(storedTheme)) {
    return { mode: storedTheme, source: "stored" };
  }

  return { mode: getSystemThemeMode(), source: "system" };
};

export const saveThemeMode = (themeMode: ThemeMode) => {
  getStorage()?.setItem(THEME_STORAGE_KEY, themeMode);
};

export const applyThemeMode = (themeMode: ThemeMode) => {
  if (typeof document === "undefined") {
    return;
  }

  const themeColor = themeMode === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;

  document.documentElement.classList.toggle("dark", themeMode === "dark");
  document.documentElement.style.colorScheme = themeMode;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", themeColor);

  void syncNativeSystemBars(themeMode, themeColor);
};

const syncNativeSystemBars = async (
  themeMode: ThemeMode,
  themeColor: string,
) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const isDarkTheme = themeMode === "dark";

  await Promise.allSettled([
    StatusBar.setStyle({ style: isDarkTheme ? Style.Dark : Style.Light }),
    StatusBar.setBackgroundColor({ color: themeColor }),
    NavigationBar.setNavigationBarColor({
      color: themeColor,
      darkButtons: !isDarkTheme,
    }),
  ]);
};

export const loadAppSettings = (): AppSettings => {
  try {
    const rawSettings = getStorage()?.getItem(SETTINGS_STORAGE_KEY);

    if (!rawSettings) {
      return createDefaultSettings();
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<AppSettings>;

    if (parsedSettings.version !== 1) {
      return createDefaultSettings();
    }

    return {
      ...createDefaultSettings(),
      vibrationIntensity: isVibrationIntensity(
        parsedSettings.vibrationIntensity,
      )
        ? parsedSettings.vibrationIntensity
        : createDefaultSettings().vibrationIntensity,
    };
  } catch {
    return createDefaultSettings();
  }
};

export const saveAppSettings = (settings: AppSettings) => {
  getStorage()?.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};
