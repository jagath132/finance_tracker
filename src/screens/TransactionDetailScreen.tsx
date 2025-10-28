import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unusedToast = toast;
import { useCategories } from "../hooks/useCategories";
import { useModal } from "../context/ModalContext";
import { useTransactions } from "../hooks/useTransactions";
import ConfirmationModal from "../components/ui/ConfirmationModal";

const TransactionDetailScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    transactions,
    loading: transactionsLoading,
    deleteTransaction,
  } = useTransactions();
  const { categories, loading: categoriesLoading } = useCategories();
  const { openModal } = useModal();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const transaction = transactions.find((t) => t.id === id) || null;

  const getCategoryName = (categoryId: string) => {
    if (categoriesLoading) return "Loading...";
    return categories.find((c) => c.id === categoryId)?.name || "Uncategorized";
  };

  const handleDeleteTransaction = async () => {
    if (!transaction) return;
    await deleteTransaction(transaction.id);
    navigate("/dashboard");
    setShowDeleteConfirm(false);
  };

  if (transactionsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-green" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <p>Transaction not found.</p>
      </div>
    );
  }

  const amountColor =
    transaction.type === "income" ? "text-brand-green" : "text-brand-red";

  return (
    <div className="min-h-screen bg-dark-primary text-white p-4 sm:p-6 lg:p-8 pb-20">
      <header className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-dark-secondary"
        >
          <ArrowLeft size={24} className="text-gray-400" />
        </button>
        <h1 className="text-xl font-bold">Transaction Receipt</h1>
        <div className="flex gap-2">
          <button
            onClick={() =>
              transaction && openModal("editTransaction", transaction)
            }
            className="p-2 rounded-full bg-dark-secondary"
          >
            <Edit size={24} className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-full bg-dark-secondary"
          >
            <Trash2 size={24} className="text-gray-400" />
          </button>
        </div>
      </header>

      <div className="bg-dark-secondary rounded-2xl p-6 shadow-lg">
        <div className="text-center border-b border-dashed border-gray-700 pb-6 mb-6">
          <p className="text-gray-400 text-sm capitalize">{transaction.type}</p>
          <p className={`text-5xl font-bold my-2 ${amountColor}`}>
            ₹
            {new Intl.NumberFormat("en-IN").format(
              Math.abs(transaction.amount)
            )}
          </p>
          <h2 className="text-2xl font-semibold">{transaction.description}</h2>
          <p className="text-gray-500">
            {new Date(transaction.transaction_date).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long", day: "numeric" }
            )}
          </p>
        </div>

        <div className="space-y-4 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500">Category</span>
            <span className="font-medium text-white">
              {getCategoryName(transaction.category_id)}
            </span>
          </div>
          {transaction.notes && (
            <div className="flex justify-between text-right">
              <span className="text-gray-500 flex-shrink-0 mr-4">Notes</span>
              <span className="font-medium text-white">
                {transaction.notes}
              </span>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
};

export default TransactionDetailScreen;
