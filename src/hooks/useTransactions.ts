import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../types/database';
import toast from 'react-hot-toast';

export const useTransactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0, incomeChange: 0, expenseChange: 0 });
    const [loading, setLoading] = useState(true);

    const summaryMemo = useMemo(() => {
        let income = 0;
        let expenses = 0;

        // Single pass through transactions for better performance
        for (const transaction of transactions) {
            if (transaction.type === 'income') {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        }

        return { income, expenses, balance: income - expenses, incomeChange: 0, expenseChange: 0 };
    }, [transactions]);

    // Remove unnecessary useEffect - set summary directly in useMemo
    useEffect(() => {
        setSummary(summaryMemo);
    }, [summaryMemo]);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('transaction_date', { ascending: false });

        if (error) {
            toast.error(error.message);
            setTransactions([]);
        } else {
            setTransactions(data || []);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
        if (!user) return;

        // Optimistically add to local state for instant UI update
        const tempId = `temp-${Date.now()}`;
        const optimisticTransaction: Transaction = {
            ...transaction,
            id: tempId,
            user_id: user.id,
            created_at: new Date().toISOString(),
        };

        setTransactions(prev => [optimisticTransaction, ...prev]);

        try {
            const { data, error } = await supabase.from('transactions').insert({ ...transaction, user_id: user.id }).select().single();

            if (error) {
                // Revert optimistic update on error
                setTransactions(prev => prev.filter(t => t.id !== tempId));
                toast.error(error.message);
            } else {
                // Replace temp transaction with real data
                setTransactions(prev => prev.map(t => t.id === tempId ? data : t));
                toast.success('Transaction added!');
            }
        } catch (error) {
            // Revert optimistic update on error
            setTransactions(prev => prev.filter(t => t.id !== tempId));
            toast.error('Failed to add transaction');
        }
    };

    const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>) => {
        const { error } = await supabase.from('transactions').update(updates).eq('id', id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Transaction updated!');
            fetchTransactions(); // Refetch
        }
    };

    const deleteTransaction = async (id: string) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Transaction deleted!');
            fetchTransactions(); // Refetch
        }
    };

    return { transactions, summary, loading, addTransaction, updateTransaction, deleteTransaction, refetch: fetchTransactions };
};
