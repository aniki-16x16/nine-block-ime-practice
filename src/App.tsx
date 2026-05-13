import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ITEM_BY_ID } from "./data/lessons";
import type { TrainingItem } from "./data/lessons";
import { LessonSelectPage } from "./pages/LessonSelectPage.tsx";
import { PracticePage } from "./pages/PracticePage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { triggerVibration } from "./utils/haptics";
import { getAccuracy } from "./utils/practice";
import type { VibrationIntensity } from "./utils/preferences";
import {
  applyThemeMode,
  loadAppSettings,
  loadThemeState,
  saveAppSettings,
  saveThemeMode,
  SYSTEM_THEME_QUERY,
} from "./utils/preferences";
import {
  loadPracticeProgress,
  recordLessonCompleted,
  recordPracticeAttempt,
  resetPracticeProgress,
  savePracticeProgress,
} from "./utils/storage";

function App() {
  const [progress, setProgress] = useState(loadPracticeProgress);
  const [settings, setSettings] = useState(loadAppSettings);
  const [themeState, setThemeState] = useState(loadThemeState);
  const weakItems = useMemo(
    () =>
      progress.weakItemIds
        .map((itemId) => ITEM_BY_ID.get(itemId))
        .filter(Boolean) as TrainingItem[],
    [progress.weakItemIds],
  );
  const totalAccuracy = getAccuracy(
    progress.correctAttempts,
    progress.totalAttempts,
  );
  const averageTime =
    progress.totalAttempts > 0
      ? progress.totalTimeMs / progress.totalAttempts
      : 0;

  useEffect(() => {
    savePracticeProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveAppSettings(settings);
  }, [settings]);

  useEffect(() => {
    applyThemeMode(themeState.mode);
  }, [themeState.mode]);

  useEffect(() => {
    if (
      themeState.source !== "system" ||
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const systemThemeQuery = window.matchMedia(SYSTEM_THEME_QUERY);
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setThemeState({
        mode: event.matches ? "dark" : "light",
        source: "system",
      });
    };

    systemThemeQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      systemThemeQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [themeState.source]);

  const handleToggleTheme = useCallback(() => {
    const nextThemeMode = themeState.mode === "dark" ? "light" : "dark";

    saveThemeMode(nextThemeMode);
    setThemeState({ mode: nextThemeMode, source: "stored" });
  }, [themeState.mode]);

  const handleRecordAttempt = useCallback(
    (
      lessonId: string,
      item: TrainingItem,
      correct: boolean,
      elapsedMs: number,
    ) => {
      setProgress((currentProgress) =>
        recordPracticeAttempt(currentProgress, {
          lessonId,
          item,
          correct,
          elapsedMs,
        }),
      );
    },
    [],
  );

  const handleCompleteLesson = useCallback((lessonId: string) => {
    setProgress((currentProgress) =>
      recordLessonCompleted(currentProgress, lessonId),
    );
  }, []);

  const handleResetProgress = useCallback(() => {
    setProgress(resetPracticeProgress());
  }, []);

  const handleChangeVibrationIntensity = useCallback(
    (vibrationIntensity: VibrationIntensity) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        vibrationIntensity,
      }));
    },
    [],
  );

  const handlePreviewVibration = useCallback(
    (vibrationIntensity: VibrationIntensity) => {
      triggerVibration(vibrationIntensity);
    },
    [],
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LessonSelectPage
            averageTime={averageTime}
            onToggleTheme={handleToggleTheme}
            progress={progress}
            themeMode={themeState.mode}
            totalAccuracy={totalAccuracy}
            weakItems={weakItems}
          />
        }
      />
      <Route
        path="/practice/:lessonId"
        element={
          <PracticePage
            onCompleteLesson={handleCompleteLesson}
            onRecordAttempt={handleRecordAttempt}
            vibrationIntensity={settings.vibrationIntensity}
          />
        }
      />
      <Route
        path="/settings"
        element={
          <SettingsPage
            onChangeVibrationIntensity={handleChangeVibrationIntensity}
            onPreviewVibration={handlePreviewVibration}
            onResetProgress={handleResetProgress}
            vibrationIntensity={settings.vibrationIntensity}
          />
        }
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
