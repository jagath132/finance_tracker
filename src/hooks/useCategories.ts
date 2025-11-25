import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import type { Database } from "../types/database";
import toast from "react-hot-toast";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Real‑time listener
  useEffect(() => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "categories"),
      where("user_id", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newCategories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(newCategories);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // No‑op fetch – real‑time listener does the work
  const fetchCategories = useCallback(async () => { }, []);

  const addCategory = async (
    category: Omit<Category, "id" | "user_id" | "created_at">
  ) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "categories"), {
        ...category,
        user_id: user.uid,
        created_at: new Date().toISOString(),
      });
      toast.success("Category added!");
    } catch (e) {
      console.error("Error adding category:", e);
      toast.error("Failed to add category");
    }
  };

  const updateCategory = async (
    id: string,
    payload: { name: string; type: "income" | "expense" }
  ) => {
    try {
      const docRef = doc(db, "categories", id);
      await updateDoc(docRef, payload);
      toast.success("Category updated!");
    } catch (e) {
      console.error("Error updating category:", e);
      toast.error("Failed to update category");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "categories", id));
      toast.success("Category deleted!");
    } catch (e) {
      console.error("Error deleting category:", e);
      toast.error("Failed to delete category");
    }
  };

  const deleteAllCategories = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "categories"),
        where("user_id", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      toast.success("All categories deleted!");
    } catch (e) {
      console.error("Error deleting all categories:", e);
      toast.error("Failed to delete all categories");
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteAllCategories,
    refetch: fetchCategories,
  };
};