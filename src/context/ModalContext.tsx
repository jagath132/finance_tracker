import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Transaction } from '../types/database';

type ModalType = 'addTransaction' | 'editTransaction' | null;

interface ModalContextType {
  modalType: ModalType;
  transaction: Transaction | null;
  openModal: (type: ModalType, transaction?: Transaction) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const openModal = (type: ModalType, transaction?: Transaction) => {
    setModalType(type);
    setTransaction(transaction || null);
  };
  const closeModal = () => {
    setModalType(null);
    setTransaction(null);
  };

  return (
    <ModalContext.Provider value={{ modalType, transaction, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
