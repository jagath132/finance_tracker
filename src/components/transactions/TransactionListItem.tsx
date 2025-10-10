import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, Category } from '../../types/database';
import ConfirmationModal from '../ui/ConfirmationModal';

interface TransactionListItemProps {
    transaction: Transaction;
    category: Category | null;
    onDelete: () => void;
    onEdit: () => void;
    onClick?: () => void;
}

const TransactionListItem: React.FC<TransactionListItemProps> = React.memo(({ transaction, category, onDelete, onEdit, onClick }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleDeleteRequest = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete();
        setIsConfirmOpen(false);
    };

    const categoryName = category?.name || 'Uncategorized';
    const categoryIcon = category?.icon || (transaction.type === 'income' ? '💰' : '🛒');
    const categoryColor = category?.color || (transaction.type === 'income' ? '#10B981' : '#EF4444');

    return (
        <>
            <div className="group bg-light-secondary dark:bg-dark-secondary p-3 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-light-primary/10 dark:border-dark-primary/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 cursor-pointer min-w-0" onClick={onClick}>
                        <div className="flex items-center mr-3 sm:mr-4 flex-shrink-0">
                            <div
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg shadow-sm"
                                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                            >
                                {categoryIcon}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-light-text dark:text-dark-text truncate text-sm sm:text-base">{transaction.description}</p>
                            <div className="flex items-center mt-1">
                                <span className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{categoryName}</span>
                                <span className="mx-1 sm:mx-2 text-light-text-secondary dark:text-dark-text-secondary hidden sm:inline">•</span>
                                <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                    {new Date(transaction.transaction_date).toLocaleDateString('en-IN', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                        <div className="text-right">
                            <p className={`font-bold text-base sm:text-lg whitespace-nowrap ${transaction.type === 'income' ? 'text-brand-green' : 'text-brand-red'}`}>
                                {transaction.type === 'income' ? '+' : '-'}₹{new Intl.NumberFormat('en-IN').format(Math.abs(transaction.amount))}
                            </p>
                        </div>
                    </div>
                </div>
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
});

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
