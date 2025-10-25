import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import toast from 'react-hot-toast';

type Category = Database['public']['Tables']['categories']['Row'];

export const useCategories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
                return;
            }

            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    ...category,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding category:', error);
                toast.error('Failed to add category');
                return;
            }

            setCategories(prev => [data, ...prev]);
            toast.success('Category added!');
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error('Failed to add category');
        }
    };

    const updateCategory = async (id: string, payload: { name: string, type: 'income' | 'expense' }) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update(payload)
                .eq('id', id)
                .eq('user_id', user?.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating category:', error);
                toast.error('Failed to update category');
                return;
            }

            setCategories(prev => prev.map(cat =>
                cat.id === id ? data : cat
            ));
            toast.success('Category updated!');
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Failed to update category');
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)
                .eq('user_id', user?.id);

            if (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
                return;
            }

            setCategories(prev => prev.filter(cat => cat.id !== id));
            toast.success('Category deleted!');
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    };

    const deleteAllCategories = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('user_id', user.id);

            if (error) {
                console.error('Error deleting all categories:', error);
                toast.error('Failed to delete all categories');
                return;
            }

            setCategories([]);
        } catch (error) {
            console.error('Error deleting all categories:', error);
            toast.error('Failed to delete all categories');
        }
    };

    return { categories, loading, addCategory, updateCategory, deleteCategory, deleteAllCategories, refetch: fetchCategories };
};
