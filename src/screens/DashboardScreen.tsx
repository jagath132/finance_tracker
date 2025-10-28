import React from 'react';
import { ArrowUpRight, ArrowDownRight, Settings, TrendingUp, TrendingDown, Loader2, Search, LogOut, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import Button from '../components/ui/Button';
import { useCategories } from '../hooks/useCategories';
import TransactionListItem from '../components/transactions/TransactionListItem';
import { useModal } from '../context/ModalContext';

// Updated SummaryCard with improved background for theme
type SummaryCardProps = {
  title: string;
  amount: number;
  change?: number;
  icon?: React.ReactElement;
  colorClass?: string;
  isBalance?: boolean;
};

const SummaryCard = React.memo<SummaryCardProps>(({ title, amount, change, icon, colorClass, isBalance = false }) => (
  <motion.div
    className="p-3 sm:p-4 rounded-2xl flex flex-col justify-between bg-light-secondary dark:bg-dark-secondary"
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-start">
      <span className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base">{title}</span>
      {icon && (
        <div className={`p-1.5 rounded-full bg-opacity-20 ${colorClass ? `bg-${colorClass}` : ''}`}>
          {React.cloneElement(icon, { className: `text-${colorClass}`, size: 16 } as any)}
        </div>
      )}
    </div>
    <div className="mt-2">
      <p className={`text-2xl font-bold ${
        isBalance
          ? (amount >= 0 ? 'text-brand-green' : 'text-brand-red')
          : 'text-light-text dark:text-dark-text'
      }`}>
        ₹{new Intl.NumberFormat('en-IN').format(amount)}
      </p>
      {change != null && change !== 0 && (
        <div className="flex items-center text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
          {change > 0 ? <ArrowUpRight size={14} className="text-brand-green" /> : <ArrowDownRight size={14} className="text-brand-red" />}
          <span className={`ml-1 ${change > 0 ? 'text-brand-green' : 'text-brand-red'}`}>{Math.abs(change)}%</span>
        </div>
      )}
    </div>
  </motion.div>
));

const DashboardScreen: React.FC = () => {
   const navigate = useNavigate();
    const { user, logout } = useAuth();
   const { transactions, summary, loading: transactionsLoading, deleteTransaction } = useTransactions();
   const { categories, loading: categoriesLoading } = useCategories();
   const { openModal } = useModal();

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  };

  const loading = transactionsLoading || categoriesLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-light-primary dark:bg-dark-primary min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Welcome back,</p>
          <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || 'User'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/search" className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary">
            <Search size={20} className="text-light-text-secondary dark:text-dark-text-secondary" />
          </Link>
          <Link to="/settings" className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary">
            <Settings size={24} className="text-light-text-secondary dark:text-dark-text-secondary" />
          </Link>
          <button onClick={async () => { await logout(); navigate('/login'); }} className="p-2 rounded-full bg-light-secondary dark:bg-dark-secondary hover:bg-light-primary dark:hover:bg-dark-primary">
            <LogOut size={20} className="text-light-text-secondary dark:text-dark-text-secondary" />
          </button>
        </div>
      </header>

      <main>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <SummaryCard title="Current Balance" amount={summary.balance} isBalance={true} icon={<DollarSign size={20} />} colorClass="brand-green" />
          <SummaryCard title="Total Income" amount={summary.income} change={summary.incomeChange} icon={<TrendingUp size={20} />} colorClass="brand-green" />
          <SummaryCard title="Total Expenses" amount={summary.expenses} change={summary.expenseChange} icon={<TrendingDown size={20} />} colorClass="brand-red" />
        </motion.div>


        <div>
          <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold">Recent Transactions</h2>
           <Link to="/transactions" className="text-brand-green text-sm">View All</Link>
         </div>
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-brand-green" size={32} />
            </div>
          ) : transactions.length > 0 ? (
            <motion.div
              className="space-y-2 sm:space-y-3"
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
              {transactions.slice(0, 5).map(tx => (
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
                    category={categories.find(c => c.id === tx.category_id) || null}
                    onDelete={() => deleteTransaction(tx.id)}
                    onEdit={() => openModal('editTransaction', tx)}
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-10 bg-light-secondary dark:bg-dark-secondary rounded-xl">
              <p className="text-light-text-secondary dark:text-dark-text-secondary">No transactions yet.</p>
              <Button onClick={() => openModal('addTransaction')} className="mt-4 max-w-xs mx-auto">Add your first transaction</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardScreen;
