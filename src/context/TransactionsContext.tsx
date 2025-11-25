import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import type { Database } from "../types/database";
import toast from "react-hot-toast";

// Adapt Transaction type for Firestore (id is string, dates might be Timestamps)
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

interface TransactionsContextType {
  transactions: Transaction[];
  summary: {
    income: number;
    expenses: number;
    balance: number;
    incomeChange: number;
    expenseChange: number;
  };
  loading: boolean;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "created_at" | "user_id">
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, "id" | "created_at" | "user_id">>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteAllTransactions: () => Promise<void>;
  refetch: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

export const useTransactionsContext = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      "useTransactionsContext must be used within a TransactionsProvider"
    );
  }
  return context;
};

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for transactions
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "transactions"),
      where("user_id", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newTransactions = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamps to strings/dates if needed
            // Assuming transaction_date is stored as string YYYY-MM-DD
          } as Transaction;
        });
        setTransactions(newTransactions);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to load transactions");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;

    for (const transaction of transactions) {
      if (transaction.type === "income") {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    }

    return {
      income,
      expenses,
      balance: income - expenses,
      incomeChange: 0,
      expenseChange: 0,
    };
  }, [transactions]);

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "created_at" | "user_id">
  ) => {
    if (!user) return;

    try {
      await addDoc(collection(db, "transactions"), {
        ...transaction,
        user_id: user.uid,
        created_at: new Date().toISOString(), // Store as ISO string for consistency
        updated_at: new Date().toISOString(),
      });
      toast.success("Transaction added!");
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<Transaction, "id" | "created_at" | "user_id">>
  ) => {
    try {
      const docRef = doc(db, "transactions", id);
      await updateDoc(docRef, {
        ...updates,
        updated_at: new Date().toISOString(),
      });
      toast.success("Transaction updated!");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
      toast.success("Transaction deleted!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const deleteAllTransactions = async () => {
    if (!user) return;

    try {
      // Firestore doesn't have a "delete collection" method for client SDKs
      // We have to batch delete
      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      toast.success("All transactions deleted!");
    } catch (error) {
      console.error("Error deleting all transactions:", error);
      toast.error("Failed to delete all transactions");
    }
  };

  const refetch = async () => {
    // No-op since we use real-time listener
  };

  const value: TransactionsContextType = {
    transactions,
    summary,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions,
    refetch,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};
