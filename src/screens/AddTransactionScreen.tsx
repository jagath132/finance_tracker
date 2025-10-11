import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Tag, Calendar, FileText, ChevronDown } from 'lucide-react';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import Button from '../components/ui/Button';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { Transaction } from '../types/database';
import toast from 'react-hot-toast';

interface AddTransactionScreenProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: Transaction;
}

const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({ isOpen, onClose, transaction }) => {
    const { addTransaction, updateTransaction } = useTransactions();
    const { categories, loading: categoriesLoading } = useCategories();

    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<number | string>('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!transaction;

    useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setAmount(transaction.amount.toString());
            setDescription(transaction.description);
            setCategoryId(transaction.category_id.toString());
            setTransactionDate(transaction.transaction_date);
            setNotes(transaction.notes || '');
        } else {
            setType('expense');
            setAmount('');
            setDescription('');
            setCategoryId('');
            setTransactionDate(new Date().toISOString().split('T')[0]);
            setNotes('');
        }
    }, [transaction]);

    useEffect(() => {
        // Reset category when type changes to avoid invalid state, but only if not editing
        if (!isEditing) {
            setCategoryId('');
        }
    }, [type, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            toast.error('Please enter a valid, positive amount.');
            return;
        }
        if (!description) {
            toast.error('Please enter a description.');
            return;
        }
        if (!categoryId) {
            toast.error('Please select a category.');
            return;
        }
        setIsSubmitting(true);
        const transactionData = {
            amount: parsedAmount,
            description,
            category_id: categoryId as string,
            transaction_date: transactionDate,
            type,
            notes,
        };
        if (isEditing && transaction) {
            await updateTransaction(transaction.id, transactionData);
        } else {
            await addTransaction(transactionData);
        }
        setIsSubmitting(false);
        onClose(); // Close modal on success
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" onClick={onClose}>
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="w-full max-w-lg bg-light-primary dark:bg-dark-secondary rounded-t-2xl max-h-[85vh] flex flex-col pb-20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex-shrink-0 p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                            <h1 className="text-xl font-bold">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h1>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-light-secondary dark:hover:bg-dark-primary">
                                <X size={24} className="text-light-text-secondary dark:text-dark-text-secondary" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-grow flex flex-col p-4 sm:p-6 overflow-y-auto">
                            {/* Transaction Type Toggle */}
                            <div className="mb-6 flex justify-center">
                                <ToggleSwitch option1="Expense" option2="Income" selected={type} setSelected={setType} />
                            </div>

                            {/* Amount Input Section */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2 text-center">Amount</label>
                                <div className="relative">
                                    <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold ${type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className={`
                                            w-full pl-12 pr-4 py-4 text-3xl font-bold text-center bg-light-secondary dark:bg-dark-secondary
                                            rounded-xl border-2 border-transparent focus:border-brand-green focus:outline-none
                                            text-light-text dark:text-dark-text
                                            placeholder:text-light-text-secondary/50 dark:placeholder:text-dark-text-secondary/50
                                        `}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Description</label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Enter description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-border dark:border-dark-border focus:border-brand-green focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Category</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={18} />
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="w-full pl-10 pr-10 py-3 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-border dark:border-dark-border focus:border-brand-green focus:outline-none appearance-none"
                                            required
                                        >
                                            <option value="" disabled>Select a category</option>
                                            {categoriesLoading ? (
                                                <option disabled>Loading categories...</option>
                                            ) : filteredCategories.length > 0 ? (
                                                filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                            ) : (
                                                <option disabled>No {type} categories available</option>
                                            )}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={18} />
                                        <input
                                            type="date"
                                            value={transactionDate}
                                            onChange={(e) => setTransactionDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-border dark:border-dark-border focus:border-brand-green focus:outline-none text-light-text dark:text-dark-text"
                                            required
                                            style={{ colorScheme: 'light' }}
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Notes <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">(optional)</span></label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 text-gray-500" size={18} />
                                        <textarea
                                            placeholder="Add any additional notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-border dark:border-dark-border focus:border-brand-green focus:outline-none resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border">
                                <Button type="submit" isLoading={isSubmitting}>{isEditing ? 'Update Transaction' : 'Save Transaction'}</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddTransactionScreen;



