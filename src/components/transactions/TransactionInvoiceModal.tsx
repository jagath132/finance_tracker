import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, FileText, Calendar, Tag, Hash, Image, Download, Edit, Trash2, Printer, ChevronDown, ChevronRight, Check, Save, Receipt } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Transaction, Category } from '../../types/database';

interface TransactionInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  category: Category | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TransactionInvoiceModal: React.FC<TransactionInvoiceModalProps> = ({
  isOpen,
  onClose,
  transaction,
  category,
  onEdit,
  onDelete,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    notes: false,
    attachments: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState(transaction);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = () => {
    // Here you would typically call an update function
    setIsEditing(false);
    // For now, just close editing mode
  };

  const handleCancel = () => {
    setEditedTransaction(transaction);
    setIsEditing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center print:hidden p-4" onClick={onClose}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl bg-light-primary dark:bg-dark-primary rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden print:max-w-none print:w-full print:max-h-none print:bg-white print:shadow-none print:rounded-none print:m-0 print:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Logo */}
            <div className="flex-shrink-0 p-6 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-brand-green/5 to-brand-green/10 dark:from-brand-green/10 dark:to-brand-green/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white dark:bg-dark-secondary rounded-xl flex items-center justify-center shadow-lg">
                    <img src="/favicon.svg" alt="Cointrail Logo" className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Cointrail</h1>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Professional Finance Tracker</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-dark-secondary/50 transition-colors"
                    title="Print Invoice"
                  >
                    <Printer size={20} className="text-light-text-secondary dark:text-dark-text-secondary" />
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`p-2 rounded-lg transition-colors ${
                        isEditing
                          ? 'bg-brand-green text-white'
                          : 'hover:bg-white/50 dark:hover:bg-dark-secondary/50 text-light-text-secondary dark:text-dark-text-secondary'
                      }`}
                      title={isEditing ? 'Save Changes' : 'Edit Transaction'}
                    >
                      {isEditing ? <Check size={20} /> : <Edit size={20} />}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete Transaction"
                    >
                      <Trash2 size={20} className="text-red-500" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-dark-secondary/50 transition-colors"
                  >
                    <X size={24} className="text-light-text-secondary dark:text-dark-text-secondary" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto">
              {/* Invoice Header */}
              <div className="p-6 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Receipt className="text-brand-green" size={24} />
                    <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">Transaction Invoice</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Invoice #</p>
                    <p className="font-mono text-lg font-semibold">{transaction.id.slice(-8)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Date</p>
                    <p className="font-medium">{new Date(transaction.transaction_date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">Time</p>
                    <p className="font-medium">{new Date(transaction.transaction_date).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details Section */}
              <div className="p-6">
                <div
                  className="flex items-center justify-between p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg cursor-pointer hover:bg-light-primary dark:hover:bg-dark-primary transition-colors"
                  onClick={() => toggleSection('details')}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="text-brand-green" size={20} />
                    <h3 className="font-semibold text-light-text dark:text-dark-text">Transaction Details</h3>
                  </div>
                  {expandedSections.details ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>

                <AnimatePresence>
                  {expandedSections.details && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-4">
                        {/* Description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Description</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedTransaction?.description || ''}
                                onChange={(e) => setEditedTransaction(prev => prev ? {...prev, description: e.target.value} : null)}
                                className="w-full p-3 border border-light-border dark:border-dark-border rounded-lg bg-light-primary dark:bg-dark-primary focus:ring-2 focus:ring-brand-green focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-light-primary dark:bg-dark-primary rounded-lg font-medium">{transaction.description}</p>
                            )}
                          </div>

                          {/* Amount */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Amount</label>
                            <div className={`p-3 rounded-lg font-bold text-xl ${
                              transaction.type === 'income'
                                ? 'bg-green-50 dark:bg-green-900/20 text-brand-green'
                                : 'bg-red-50 dark:bg-red-900/20 text-brand-red'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}₹{new Intl.NumberFormat('en-IN').format(transaction.amount)}
                            </div>
                          </div>
                        </div>

                        {/* Category and Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Category</label>
                            <div className="flex items-center space-x-3 p-3 bg-light-primary dark:bg-dark-primary rounded-lg">
                              {category?.icon && React.createElement((Icons as any)[category.icon.charAt(0).toUpperCase() + category.icon.slice(1)] || Tag, {
                                size: 20,
                                className: "text-brand-green"
                              })}
                              <span className="font-medium">{category?.name || 'Uncategorized'}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Type</label>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              transaction.type === 'income'
                                ? 'bg-green-100 dark:bg-green-900/30 text-brand-green'
                                : 'bg-red-100 dark:bg-red-900/30 text-brand-red'
                            }`}>
                              <span className="capitalize">{transaction.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notes Section */}
              {transaction.notes && (
                <div className="p-6 border-t border-light-border dark:border-dark-border">
                  <div
                    className="flex items-center justify-between p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg cursor-pointer hover:bg-light-primary dark:hover:bg-dark-primary transition-colors"
                    onClick={() => toggleSection('notes')}
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="text-brand-green" size={20} />
                      <h3 className="font-semibold text-light-text dark:text-dark-text">Notes</h3>
                    </div>
                    {expandedSections.notes ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>

                  <AnimatePresence>
                    {expandedSections.notes && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-light-primary dark:bg-dark-primary rounded-lg">
                          <p className="text-light-text dark:text-dark-text whitespace-pre-wrap">{transaction.notes}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Attachments Section */}
              {transaction.attachment_url && (
                <div className="p-6 border-t border-light-border dark:border-dark-border">
                  <div
                    className="flex items-center justify-between p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg cursor-pointer hover:bg-light-primary dark:hover:bg-dark-primary transition-colors"
                    onClick={() => toggleSection('attachments')}
                  >
                    <div className="flex items-center space-x-3">
                      <Image className="text-brand-green" size={20} />
                      <h3 className="font-semibold text-light-text dark:text-dark-text">Attachments</h3>
                    </div>
                    {expandedSections.attachments ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>

                  <AnimatePresence>
                    {expandedSections.attachments && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-light-primary dark:bg-dark-primary rounded-lg">
                          {/\.(jpg|jpeg|png|gif|webp)$/i.test(transaction.attachment_url) ? (
                            <img
                              src={transaction.attachment_url}
                              alt="Attachment"
                              className="max-w-full h-auto rounded-lg shadow-md"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg">
                              <Download className="text-brand-green" size={24} />
                              <div>
                                <p className="font-medium text-light-text dark:text-dark-text">Download File</p>
                                <a
                                  href={transaction.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-green hover:underline text-sm"
                                >
                                  Click to download
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Edit Actions */}
              {isEditing && (
                <div className="p-6 border-t border-light-border dark:border-dark-border bg-light-secondary dark:bg-dark-secondary">
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-primary dark:hover:bg-dark-primary rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-6 border-t border-light-border dark:border-dark-border bg-gradient-to-r from-brand-green/5 to-brand-green/10 dark:from-brand-green/10 dark:to-brand-green/20">
                <div className="text-center">
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                    Thank you for using Cointrail!
                  </p>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    Generated on {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionInvoiceModal;