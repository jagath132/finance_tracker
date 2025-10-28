import React, { useState } from 'react';
import { Plus, Loader2, ShoppingBag, Gift, Film, Briefcase, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCategories } from '../hooks/useCategories';
import Button from '../components/ui/Button';
import { Category } from '../types/database';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import EditCategoryModal from '../components/categories/EditCategoryModal';

const iconMap = {
    Shopping: <ShoppingBag className="text-brand-green" />,
    Gifts: <Gift className="text-brand-green" />,
    Entertainment: <Film className="text-brand-green" />,
    Salary: <Briefcase className="text-brand-green" />,
    Default: <ShoppingBag className="text-brand-green" />,
};

const AddCategoryForm: React.FC<{ onAdd: (name: string, type: 'income' | 'expense') => void, onCancel: () => void }> = ({ onAdd, onCancel }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onAdd(name.trim(), type);
            setName('');
            setType('expense');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-light-secondary dark:bg-dark-secondary p-4 rounded-lg mt-4 space-y-4">
            <input
                className="w-full rounded-lg p-3 bg-white dark:bg-dark-primary text-black dark:text-white border border-gray-300 focus:border-brand-green outline-none transition"
                placeholder="Category Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
            />
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} /> Expense
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} /> Income
                </label>
            </div>
            <div className="flex gap-2">
                <Button type="submit">Add</Button>
                <Button type="button" onClick={onCancel} className="bg-red-500 hover:bg-red-600 text-white">Cancel</Button>
            </div>
        </form>
    );
};

const CategoriesScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { categories, loading, addCategory, deleteCategory, updateCategory } = useCategories();
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const tabFilteredCategories = categories.filter(c => c.type === activeTab);
    const searchedCategories = tabFilteredCategories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAddCategory = (name: string, type: 'income' | 'expense') => {
        addCategory({ name, type });
        setShowAddForm(false);
    };

    const handleConfirmDelete = () => {
        if (categoryToDelete) {
            deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
        }
    };

    const handleSaveCategory = (id: string, name: string, type: 'income' | 'expense') => {
        updateCategory(id, { name, type });
        setCategoryToEdit(null);
    };

    // When a category is clicked, show the popup
    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category);
    };

    // Edit from popup: open the edit modal
    const handleEditCategory = (category: Category) => {
        setCategoryToEdit(category);
        setSelectedCategory(null);
    };

    // Delete from popup: open the confirmation modal
    const handleDeleteCategory = (category: Category) => {
        setCategoryToDelete(category);
        setSelectedCategory(null);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-20">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Categories</h1>
                <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="bg-brand-green text-white p-2 rounded-full shadow-lg">
                    <Plus size={20} />
                </button>
            </header>

            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search categories..."
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
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AddCategoryForm onAdd={handleAddCategory} onCancel={() => setShowAddForm(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex border-b border-light-border dark:border-dark-border mb-6 mt-4">
                <button
                    type="button"
                    onClick={() => setActiveTab('expense')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'expense' ? 'text-brand-green border-b-2 border-brand-green' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}
                >
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('income')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'income' ? 'text-brand-green border-b-2 border-brand-green' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}
                >
                    Income
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-brand-green" size={32} />
                </div>
            ) : searchedCategories.length > 0 ? (
                <AnimatePresence>
                    <div>
                        {searchedCategories.map(cat => (
                            <motion.div
                                key={cat.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white dark:bg-dark-secondary shadow-md hover:shadow-lg rounded-xl p-4 mb-4 cursor-pointer transform hover:scale-105 transition-all duration-200 flex items-center justify-between"
                                onClick={() => handleCategoryClick(cat)}
                            >
                                <div className="flex items-center gap-3">
                                    {iconMap[cat.icon as keyof typeof iconMap] || iconMap.Default}
                                    <span className="font-bold break-words truncate max-w-[150px] sm:max-w-xs">{cat.name}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            ) : searchTerm ? (
                <div className="text-center py-20">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                        No results found for "{searchTerm}"
                    </p>
                    <button onClick={() => setSearchTerm('')} className="text-brand-green hover:underline">Clear search</button>
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                        You have no {activeTab} categories.
                    </p>
                </div>
            )}

            {/* Popup Modal for Edit/Delete */}
            {selectedCategory && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-dark-secondary rounded-xl p-6 w-96 shadow-lg"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            {iconMap[selectedCategory.icon as keyof typeof iconMap] || iconMap.Default}
                            <h3 className="font-bold break-words">{selectedCategory.name}</h3>
                        </div>
                        <div className="flex gap-4">
                            <button
                                className="flex-1 bg-blue-500 text-white rounded-lg py-2"
                                onClick={() => handleEditCategory(selectedCategory)}
                            >
                                Edit
                            </button>
                            <button
                                className="flex-1 bg-red-500 text-white rounded-lg py-2"
                                onClick={() => handleDeleteCategory(selectedCategory)}
                            >
                                Delete
                            </button>
                        </div>
                        <button
                            className="mt-4 w-full bg-gray-200 dark:bg-dark-primary text-red-500 hover:text-red-600 font-medium py-2 rounded-lg"
                            onClick={() => setSelectedCategory(null)}
                        >
                            Cancel
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Confirmation Modal for Delete */}
            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                message={`Are you sure you want to delete the "${categoryToDelete?.name}" category? This might affect existing transactions.`}
            />

            {/* Edit Modal for Edit */}
            <EditCategoryModal
                isOpen={!!categoryToEdit}
                onClose={() => setCategoryToEdit(null)}
                onSave={handleSaveCategory}
                category={categoryToEdit}
            />
        </div>
    );
};

export default CategoriesScreen;
