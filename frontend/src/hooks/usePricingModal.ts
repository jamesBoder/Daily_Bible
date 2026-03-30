import React, { createContext, useContext, useState, useCallback, createElement } from 'react';

export type PricingModalView = 'plans' | 'otp';

interface PricingModalContextType {
  isOpen: boolean;
  initialView: PricingModalView;
  openModal: (view?: PricingModalView) => void;
  closeModal: () => void;
}

export const PricingModalContext = createContext<PricingModalContextType | undefined>(undefined);

export const usePricingModal = (): PricingModalContextType => {
  const ctx = useContext(PricingModalContext);
  if (!ctx) {
    throw new Error('usePricingModal must be used within a PricingModalProvider');
  }
  return ctx;
};

// PricingModalProvider is defined as a plain function component
// so it can be imported without importing React in consumer files.
export function PricingModalProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<PricingModalView>('plans');

  const openModal = useCallback((view: PricingModalView = 'plans') => {
    setInitialView(view);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return createElement(
    PricingModalContext.Provider,
    { value: { isOpen, initialView, openModal, closeModal } },
    children,
  );
}
