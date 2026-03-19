import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../services/api/client';
import { type ThemeId } from '../contexts/ThemeContext';

export interface UnlockSummary {
  theme_id: ThemeId;
  name: string;
  cost: number;
  is_owned: boolean;
  is_free: boolean;
}

export function useUnlocks() {
  const { t } = useTranslation();
  const [unlocks, setUnlocks] = useState<UnlockSummary[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const fetchUnlocks = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ themes: UnlockSummary[]; blessings_balance: number }>('/api/unlocks');
      setUnlocks(data.themes);
      setBalance(data.blessings_balance);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setIsGuest(true);
      }
      // other errors: leave unlocks empty; free themes still render as owned via ThemePicker fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUnlocks(); }, [fetchUnlocks]);

  const purchaseTheme = useCallback(async (themeId: ThemeId): Promise<boolean> => {
    setPurchaseError(null);
    try {
      const { data } = await apiClient.post<{ blessings_balance: number }>('/api/blessings/spend', { theme_id: themeId });
      setBalance(data.blessings_balance);
      setUnlocks(prev => prev.map(u => u.theme_id === themeId ? { ...u, is_owned: true } : u));
      return true;
    } catch (err: any) {
      const errorCode = err?.response?.data?.error;
      if (errorCode === 'insufficient_blessings') {
        setPurchaseError(t('settings.appearance.purchaseErrorInsufficient'));
      } else {
        setPurchaseError(t('settings.appearance.purchaseErrorGeneric'));
      }
      return false;
    }
  }, [t]);

  return { unlocks, balance, isLoading, isGuest, purchaseTheme, purchaseError };
}
