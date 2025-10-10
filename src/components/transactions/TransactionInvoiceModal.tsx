import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, FileText, Calendar, Tag, Hash, Image, Download } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Transaction, Category } from '../../types/database';

interface TransactionInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  category: Category | null;
}

const TransactionInvoiceModal: React.FC<TransactionInvoiceModalProps> = ({
  isOpen,
  onClose,
  transaction,
  category,
}) => {
  if (!transaction) return null;

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
              <h1 className="text-xl font-bold">Invoice</h1>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-light-secondary dark:hover:bg-dark-primary">
                <X size={24} className="text-light-text-secondary dark:text-dark-text-secondary" />
              </button>
            </div>

            <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="bg-dark-secondary p-4 rounded-full inline-block mb-4">
                  <Coins className="text-brand-green" size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Cointrail</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">Personal Finance Tracker</p>
              </div>

              {/* Invoice Details */}
              <div className="bg-light-secondary dark:bg-dark-secondary rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Invoice #</span>
                  <span className="font-mono text-sm">{transaction.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Date</span>
                  <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4 bg-light-secondary dark:bg-dark-secondary rounded-xl p-4">
                <div className="flex items-center">
                  <FileText className="text-gray-500 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Description</p>
                    <p className="font-semibold">{transaction.description}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Hash className="text-gray-500 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Amount</p>
                    <p className={`font-bold text-xl ${transaction.type === 'income' ? 'text-brand-green' : 'text-brand-red'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{new Intl.NumberFormat('en-IN').format(transaction.amount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Tag className="text-gray-500 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Category</p>
                    <div className="flex items-center">
                      {category?.icon && React.createElement((Icons as any)[category.icon.charAt(0).toUpperCase() + category.icon.slice(1)] || Tag, { size: 16, className: "mr-2" })}
                      <p>{category?.name || 'Uncategorized'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="text-gray-500 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Type</p>
                    <p className="capitalize">{transaction.type}</p>
                  </div>
                </div>

                {transaction.notes && (
                  <div className="flex items-start">
                    <FileText className="text-gray-500 mr-3 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Notes</p>
                      <p>{transaction.notes}</p>
                    </div>
                  </div>
                )}

                {transaction.attachment_url && (
                  <div className="flex items-start">
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(transaction.attachment_url) ? (
                      <Image className="text-gray-500 mr-3 mt-1" size={20} />
                    ) : (
                      <Download className="text-gray-500 mr-3 mt-1" size={20} />
                    )}
                    <div>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Attachment</p>
                      {/\.(jpg|jpeg|png|gif|webp)$/i.test(transaction.attachment_url) ? (
                        <img src={transaction.attachment_url} alt="Attachment" className="max-w-full h-auto rounded mt-2" />
                      ) : (
                        <a href={transaction.attachment_url} target="_blank" rel="noopener noreferrer" className="text-brand-green underline">
                          Download File
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center mt-8 pt-4 border-t border-light-border dark:border-dark-border">
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Thank you for using Cointrail!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionInvoiceModal;