import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowLeft, ChevronUp, Calendar, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TransactionListItem from '../components/transactions/TransactionListItem';
import TransactionInvoiceModal from '../components/transactions/TransactionInvoiceModal';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useModal } from '../context/ModalContext';
import { Transaction } from '../types/database';

const TransactionsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { transactions, loading: transactionsLoading, deleteTransaction } = useTransactions();
    const { categories, loading: categoriesLoading } = useCategories();
    const { openModal } = useModal();
    const [invoiceTransactionId, setInvoiceTransactionId] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
    };

    const getCategory = (categoryId: string) => {
        return categories.find(c => c.id === categoryId) || null;
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const loading = transactionsLoading || categoriesLoading;

    // Filter and group transactions by date - optimized with useMemo
    const groupedTransactions = React.useMemo(() => {
        const filteredTransactions = transactions.filter(tx =>
            tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCategoryName(tx.category_id).toLowerCase().includes(searchTerm.toLowerCase())
        );

        const groups: Record<string, Transaction[]> = {};

        // Single pass grouping for better performance
        for (const tx of filteredTransactions) {
            const date = new Date(tx.transaction_date).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(tx);
        }

        return groups;
    }, [transactions, searchTerm, categories]);

    return (
        <div className="min-h-screen p-4 sm:p-6">
            <header className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary">
                        <ArrowLeft size={24} className="text-light-text-secondary dark:text-dark-text-secondary" />
                    </button>
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <div className="w-8"></div> {/* Spacer for balance */}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-border dark:border-dark-border focus:border-brand-green focus:outline-none"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-brand-green" size={32} />
                </div>
            ) : transactions.length > 0 ? (
                <AnimatePresence>
                    <motion.div
                        className="space-y-4 sm:space-y-6"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.05,
                                    delayChildren: 0.1,
                                },
                            },
                        }}
                    >
                        {Object.entries(groupedTransactions).map(([date, txs]) => (
                            <motion.div
                                key={date}
                                layout
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                            <div className="flex items-center mb-2 sm:mb-3">
                                <Calendar size={16} className="text-light-text-secondary dark:text-dark-text-secondary mr-2" />
                                <h3 className="text-base sm:text-lg font-semibold text-light-text dark:text-dark-text">
                                    {new Date(date).toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {txs.map(tx => (
                                    <TransactionListItem
                                        key={tx.id}
                                        transaction={tx}
                                        category={getCategory(tx.category_id)}
                                        onDelete={() => deleteTransaction(tx.id)}
                                        onEdit={() => setInvoiceTransactionId(tx.id)}
                                        onClick={() => navigate(`/transactions/${tx.id}`)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
            ) : searchTerm ? (
                <div className="text-center py-20">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">No transactions found for "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm('')} className="text-brand-green hover:underline">Clear search</button>
                </div>
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

            {/* Invoice Modal */}
            <TransactionInvoiceModal
                key={invoiceTransactionId}
                isOpen={!!invoiceTransactionId}
                onClose={() => setInvoiceTransactionId(null)}
                transaction={transactions.find(tx => tx.id === invoiceTransactionId) || null}
                category={getCategory(transactions.find(tx => tx.id === invoiceTransactionId)?.category_id || '')}
                onEdit={() => {
                    const tx = transactions.find(tx => tx.id === invoiceTransactionId);
                    if (tx) openModal('editTransaction', tx);
                    setInvoiceTransactionId(null);
                }}
                onDelete={() => {
                    const tx = transactions.find(tx => tx.id === invoiceTransactionId);
                    if (tx) deleteTransaction(tx.id);
                    setInvoiceTransactionId(null);
                }}
            />
        </div>
    );
};

export default TransactionsScreen;
