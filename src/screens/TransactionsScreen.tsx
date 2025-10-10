import React from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, ArrowLeft, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TransactionListItem from '../components/transactions/TransactionListItem';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useModal } from '../context/ModalContext';

const TransactionsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { transactions, loading: transactionsLoading, deleteTransaction } = useTransactions();
    const { categories, loading: categoriesLoading } = useCategories();
    const { openModal } = useModal();

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const loading = transactionsLoading || categoriesLoading;

    return (
        <div className="min-h-screen p-4 sm:p-6">
            <header className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary">
                    <ArrowLeft size={24} className="text-light-text-secondary dark:text-dark-text-secondary" />
                </button>
                <h1 className="text-2xl font-bold">Transactions</h1>
                <button onClick={() => navigate('/search')} className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary">
                    <Search size={20} className="text-light-text-secondary dark:text-dark-text-secondary" />
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-brand-green" size={32} />
                </div>
            ) : transactions.length > 0 ? (
                <motion.div
                    className="space-y-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.05,
                            },
                        },
                    }}
                >
                    {transactions.map(tx => (
                        <motion.div
                            key={tx.id}
                            variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <TransactionListItem
                                transaction={tx}
                                categoryName={getCategoryName(tx.category_id)}
                                onDelete={() => deleteTransaction(tx.id)}
                                onEdit={() => openModal('editTransaction', tx)}
                                onClick={() => navigate(`/transactions/${tx.id}`)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">You have no transactions.</p>
                    <Link to="/add-transaction" className="bg-brand-green text-white font-bold py-3 px-6 rounded-xl text-lg hover:bg-green-600 transition-colors">
                        Add Transaction
                    </Link>
                </div>
            )}
            {/* Floating Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-20 right-4 p-3 rounded-full bg-brand-green hover:bg-green-600 text-white shadow-lg transition-colors z-50"
            >
                <ChevronUp size={24} />
            </button>
        </div>
    );
};

export default TransactionsScreen;
