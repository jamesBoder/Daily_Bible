import { useState, useEffect, useCallback } from 'react';
import {
  ROSARY_MYSTERY_SETS,
  ROSARY_PRAYERS,
  buildRosarySequence,
  TOTAL_BEADS,
  type MysterySetKey,
  type RosaryStep,
} from '../features/prayer/data/rosaryData';
import { SoundService } from '../services/SoundService';

const SESSION_KEY = 'wop_rosary_session';

interface RosarySession {
  mysterySetKey: MysterySetKey;
  stepIndex: number;
}

function loadSession(): RosarySession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RosarySession;
  } catch {
    return null;
  }
}

function saveSession(session: RosarySession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export interface UseRosaryReturn {
  mysterySetKey: MysterySetKey;
  stepIndex: number;
  currentStep: RosaryStep;
  currentPrayer: string;
  currentMystery: { title: string; scripture: string; meditation: string } | null;
  totalBeads: number;
  completedBeads: number;
  isComplete: boolean;
  hasSession: boolean;
  advance: () => void;
  reset: () => void;
  startSession: (setKey: MysterySetKey) => void;
}

const SEQUENCE = buildRosarySequence();

function getPrayer(step: RosaryStep): string {
  switch (step.stepType) {
    case 'apostles-creed':  return ROSARY_PRAYERS.apostlesCreed;
    case 'our-father':      return ROSARY_PRAYERS.ourFather;
    case 'hail-mary':       return ROSARY_PRAYERS.hailMary;
    case 'glory-be':        return ROSARY_PRAYERS.gloryBe;
    case 'fatima':          return ROSARY_PRAYERS.fatimaPrayer;
    case 'hail-holy-queen': return ROSARY_PRAYERS.hailHolyQueen;
    case 'complete':        return '';
    default:                return '';
  }
}

function getMystery(step: RosaryStep, setKey: MysterySetKey) {
  if (step.decadeIndex < 0) return null;
  const set = ROSARY_MYSTERY_SETS.find(s => s.key === setKey);
  return set?.mysteries[step.decadeIndex] ?? null;
}

export function useRosary(): UseRosaryReturn {
  // Load once at mount only (useState initializer runs once)
  const [mysterySetKey, setMysterySetKey] = useState<MysterySetKey>(() => loadSession()?.mysterySetKey ?? 'joyful');
  const [stepIndex, setStepIndex] = useState<number>(() => loadSession()?.stepIndex ?? -1); // -1 = not started

  // hasSession reflects whether there is an in-progress session (derived from state only)
  const hasSession = stepIndex >= 0;
  const isStarted = stepIndex >= 0;
  const currentStep = isStarted ? SEQUENCE[stepIndex] : SEQUENCE[0];
  const isComplete = isStarted && currentStep?.stepType === 'complete';

  // Count completed beads (steps that are NOT 'complete' marker)
  const completedBeads = isStarted
    ? SEQUENCE.slice(0, stepIndex).filter(s => s.stepType !== 'complete').length
    : 0;

  const advance = useCallback(() => {
    if (!isStarted || isComplete) return;
    const next = stepIndex + 1;
    const nextStep = SEQUENCE[next];
    if (!nextStep) return;

    SoundService.play('rosary-bead');
    if (navigator.vibrate) navigator.vibrate(8);

    setStepIndex(next);
    const session: RosarySession = { mysterySetKey, stepIndex: next };

    if (nextStep.stepType === 'complete') {
      clearSession();
    } else {
      saveSession(session);
    }
  }, [isStarted, isComplete, stepIndex, mysterySetKey]);

  const reset = useCallback(() => {
    clearSession();
    setStepIndex(-1);
  }, []);

  const startSession = useCallback((setKey: MysterySetKey) => {
    setMysterySetKey(setKey);
    setStepIndex(0);
    saveSession({ mysterySetKey: setKey, stepIndex: 0 });
  }, []);

  // On complete, clear session
  useEffect(() => {
    if (isComplete) {
      clearSession();
    }
  }, [isComplete]);

  return {
    mysterySetKey,
    stepIndex,
    currentStep,
    currentPrayer: getPrayer(currentStep),
    currentMystery: getMystery(currentStep, mysterySetKey),
    totalBeads: TOTAL_BEADS,
    completedBeads,
    isComplete,
    hasSession,
    advance,
    reset,
    startSession,
  };
}
