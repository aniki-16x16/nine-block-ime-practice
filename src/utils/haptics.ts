import type { VibrationIntensity } from "./preferences";

const vibrationDurations: Record<VibrationIntensity, number> = {
  0: 0,
  1: 16,
  2: 42,
};

type VibrationNavigator = Navigator & {
  vibrate?: (pattern: number | number[]) => boolean;
};

export const triggerVibration = (intensity: VibrationIntensity) => {
  const duration = vibrationDurations[intensity];

  if (duration <= 0 || typeof navigator === "undefined") {
    return false;
  }

  const vibrationNavigator = navigator as VibrationNavigator;

  if (typeof vibrationNavigator.vibrate !== "function") {
    return false;
  }

  return vibrationNavigator.vibrate(duration);
};
