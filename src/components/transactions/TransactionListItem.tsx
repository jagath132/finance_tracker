import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown, Trash2, Edit, X } from 'lucide-react';
import { Transaction } from '../../types/database';
import ConfirmationModal from '../ui/ConfirmationModal';

interface TransactionListItemProps {
    transaction: Transaction;
    categoryName: string;
    onDelete: () => void;
    onEdit: () => void;
    onClick?: () => void;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction, categoryName, onDelete, onEdit, onClick }) => {
    const x = useMotionValue(0);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleDeleteRequest = () => {
        setIsConfirmOpen(true);
        x.set(0); // Reset position after opening modal
    };

    const handleConfirmDelete = () => {
        onDelete();
        setIsConfirmOpen(false);
    };

    return (
        <>
            <div className="relative mb-3">
                <motion.div
                    className="absolute inset-0 flex justify-start items-center px-6 bg-blue-500 rounded-xl"
                    style={{ opacity: useTransform(x, [0, -100], [0, 1]) }}
                >
                    <Edit size={20} className="text-white" />
                </motion.div>
                <motion.div
                    className="absolute inset-0 flex justify-end items-center px-6 bg-red-500 rounded-xl"
                    style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
                >
                    <Trash2 size={20} className="text-white" />
                </motion.div>

                <motion.div
                    drag="x"
                    dragConstraints={{ left: -100, right: 100 }}
                    onDragEnd={(_, info) => {
                        if (info.offset.x > 50) {
                            onEdit();
                            x.set(0);
                        } else if (info.offset.x < -50) {
                            handleDeleteRequest();
                        }
                    }}
                    style={{ x }}
                    className="relative bg-light-secondary dark:bg-dark-secondary p-4 rounded-xl z-10 cursor-pointer"
                >
                    <div onClick={onClick}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-full mr-4 ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {transaction.type === 'income' ? <TrendingUp className="text-brand-green" /> : <TrendingDown className="text-brand-red" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-light-text dark:text-dark-text truncate">{transaction.description}</p>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{categoryName}</p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className={`font-bold whitespace-nowrap ${transaction.type === 'income' ? 'text-brand-green' : 'text-brand-red'}`}>
                                    {transaction.type === 'income' ? '+' : '-'}₹{new Intl.NumberFormat('en-IN').format(Math.abs(transaction.amount))}
                                </p>
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">{new Date(transaction.transaction_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
            />
        </>
    );
};

export default TransactionListItem;
