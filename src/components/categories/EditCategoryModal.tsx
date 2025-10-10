import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Category } from '../../types/database';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, type: 'income' | 'expense') => void;
  category: Category | null;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ isOpen, onClose, onSave, category }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && name.trim()) {
      setIsLoading(true);
      onSave(category.id, name.trim(), type);
      // The parent component will handle closing and loading state
    }
  };

  return (
    <AnimatePresence>
      {isOpen && category && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-light-secondary dark:bg-dark-secondary rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Category Name" value={name} onChange={e => setName(e.target.value)} required />
              <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} className="form-radio text-brand-red" /> Expense</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} className="form-radio text-brand-green" /> Income</label>
              </div>
              <div className="flex gap-4 mt-6">
                <Button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
                <Button type="submit" isLoading={isLoading}>Save Changes</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditCategoryModal;
