import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import toast from 'react-hot-toast';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface TransactionsContextType {
  transactions: Transaction[];
  summary: {
    income: number;
    expenses: number;
    balance: number;
    incomeChange: number;
    expenseChange: number;
  };
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const useTransactionsContext = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactionsContext must be used within a TransactionsProvider');
  }
  return context;
};

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    incomeChange: 0,
    expenseChange: 0,
  });
  const [loading, setLoading] = useState(true);

  const summaryMemo = useMemo(() => {
    let income = 0;
    let expenses = 0;

    for (const transaction of transactions) {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    }

    return {
      income,
      expenses,
      balance: income - expenses,
      incomeChange: 0,
      expenseChange: 0,
    };
  }, [transactions]);

  useEffect(() => {
    setSummary(summaryMemo);
  }, [summaryMemo]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (
    transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        toast.error('Failed to add transaction');
        return;
      }

      setTransactions((prev) => [data, ...prev]);
      toast.success('Transaction added!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        toast.error('Failed to update transaction');
        return;
      }

      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? data : t))
      );
      toast.success('Transaction updated!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Failed to delete transaction');
        return;
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success('Transaction deleted!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const value: TransactionsContextType = {
    transactions,
    summary,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};