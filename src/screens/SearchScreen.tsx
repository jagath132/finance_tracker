import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import TransactionListItem from "../components/transactions/TransactionListItem";
import { useCategories } from "../hooks/useCategories";
import { useDebounce } from "../hooks/useDebounce";
import { useTransactions } from "../hooks/useTransactions";

// Define local types since we removed Supabase types
interface Transaction {
  id: string;
  amount: number;
  description: string;
  category_id: string;
  user_id: string;
  transaction_date: string;
  type: "income" | "expense";
  created_at: string;
  notes?: string;
  attachment_url?: string;
  updated_at?: string;
}

const SearchScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories } = useCategories();
  const { transactions } = useTransactions();

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const performSearch = useCallback(
    async (term: string) => {
      if (!user || term.trim() === "") {
        setResults([]);
        setHasSearched(term.trim() !== "");
        return;
      }
      setIsLoading(true);
      setHasSearched(true);

      // Mock search - filter transactions locally
      const filteredResults = transactions
        .filter((tx) =>
          tx.description.toLowerCase().includes(term.toLowerCase())
        )
        .sort(
          (a, b) =>
            new Date(b.transaction_date).getTime() -
            new Date(a.transaction_date).getTime()
        );

      setResults(filteredResults as Transaction[]);
      setIsLoading(false);
    },
    [user, transactions]
  );

  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Uncategorized";
  };

  const handleDelete = async (id: string) => {
    // Mock delete - remove from local results
    setResults((prev) => prev.filter((tx) => tx.id !== id));
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white p-4 sm:p-6 lg:p-8 pb-20">
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-dark-secondary"
        >
          <ArrowLeft size={24} className="text-gray-400" />
        </button>
        <div className="relative flex-grow">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-green"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      <main>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-brand-green" size={32} />
          </div>
        ) : hasSearched ? (
          results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-2">
                {results.length} result(s) found
              </p>
              {results.map((tx) => (
                <TransactionListItem
                  key={tx.id}
                  transaction={tx}
                  category={getCategoryName(tx.category_id)}
                  onDelete={() => handleDelete(tx.id)}
                  onEdit={() => navigate(`/transactions/${tx.id}`)}
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400">
                No transactions found for "{debouncedSearchTerm}".
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400">
              Start typing to search your transactions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchScreen;
