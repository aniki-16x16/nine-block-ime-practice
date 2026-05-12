import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ITEM_BY_ID } from "./data/lessons";
import type { TrainingItem } from "./data/lessons";
import { LessonSelectPage } from "./pages/LessonSelectPage.tsx";
import { PracticePage } from "./pages/PracticePage.tsx";
import { getAccuracy } from "./utils/practice";
import {
  loadPracticeProgress,
  recordLessonCompleted,
  recordPracticeAttempt,
  resetPracticeProgress,
  savePracticeProgress,
} from "./utils/storage";

function App() {
  const [progress, setProgress] = useState(loadPracticeProgress);
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

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LessonSelectPage
            averageTime={averageTime}
            onResetProgress={handleResetProgress}
            progress={progress}
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
          />
        }
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
