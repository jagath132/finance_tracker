import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { Category, Database } from '../types/database';
import toast from 'react-hot-toast';

export const useCategories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name', { ascending: true });

        if (error) {
            toast.error(error.message);
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (category: Omit<Database['public']['Tables']['categories']['Insert'], 'user_id'>) => {
        if (!user) return;
        const { error } = await supabase.from('categories').insert({ ...category, user_id: user.id });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Category added!');
            fetchCategories(); // Refetch
        }
    };

    const updateCategory = async (id: string, payload: { name: string, type: 'income' | 'expense' }) => {
        const { error } = await supabase.from('categories').update(payload).eq('id', id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Category updated!');
            fetchCategories(); // Refetch
        }
    };

    const deleteCategory = async (id: string) => {
        // You might want to check if transactions use this category first
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Category deleted!');
            fetchCategories(); // Refetch
        }
    };

    return { categories, loading, addCategory, updateCategory, deleteCategory, refetch: fetchCategories };
};
