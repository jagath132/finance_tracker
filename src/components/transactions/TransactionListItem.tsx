import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
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
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleDeleteRequest = () => {
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete();
        setIsConfirmOpen(false);
    };

    return (
        <>
            <div className="bg-light-secondary dark:bg-dark-secondary p-4 rounded-xl mb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 cursor-pointer" onClick={onClick}>
                        <div className={`p-3 rounded-full mr-4 ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {transaction.type === 'income' ? <TrendingUp className="text-brand-green" /> : <TrendingDown className="text-brand-red" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-light-text dark:text-dark-text truncate">{transaction.description}</p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{categoryName}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 rounded-full hover:bg-light-primary dark:hover:bg-dark-primary">
                            <Edit size={16} className="text-light-text-secondary dark:text-dark-text-secondary" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRequest(); }} className="p-2 rounded-full hover:bg-light-primary dark:hover:bg-dark-primary">
                            <Trash2 size={16} className="text-light-text-secondary dark:text-dark-text-secondary" />
                        </button>
                        <div className="text-right flex-shrink-0 ml-2">
                            <p className={`font-bold whitespace-nowrap ${transaction.type === 'income' ? 'text-brand-green' : 'text-brand-red'}`}>
                                {transaction.type === 'income' ? '+' : '-'}₹{new Intl.NumberFormat('en-IN').format(Math.abs(transaction.amount))}
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">{new Date(transaction.transaction_date).toLocaleDateString()}</p>
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
};

export default TransactionListItem;
