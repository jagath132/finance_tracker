import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import { useTransactions } from "../hooks/useTransactions";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { useCategories } from "../hooks/useCategories";

const ExportDataScreen: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { categories } = useCategories();
  const [isExporting, setIsExporting] = useState(false);

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name || "N/A";

  const handleExport = async () => {
    setIsExporting(true);
    if (transactions.length === 0) {
      toast.error("No transactions to export.");
      setIsExporting(false);
      return;
    }

    const toastId = toast.loading(`Exporting as CSV...`);

    try {
      const dataToExport = transactions.map((t) => ({
        Date: new Date(t.transaction_date).toLocaleDateString(),
        Description: t.description,
        Category: getCategoryName(t.category_id),
        Type: t.type,
        Amount: t.amount,
        Notes: t.notes || "",
      }));

      const filename = `cointrail-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      const csv = Papa.unparse(dataToExport);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Export successful!", { id: toastId });
    } catch (error) {
      toast.error("An error occurred during export.", { id: toastId });
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white p-4 sm:p-6 lg:p-8 pb-20">
      <header className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-dark-secondary"
        >
          <ArrowLeft size={24} className="text-gray-400" />
        </button>
        <h1 className="text-xl font-bold">Export Data</h1>
        <div className="w-10"></div>
      </header>

      <div className="bg-dark-secondary p-6 rounded-2xl text-center">
        <p className="text-gray-400 mb-4">
          Export all your transaction data into a single CSV file.
        </p>
        <div className="mt-6">
          <Button
            onClick={handleExport}
            isLoading={isExporting || transactionsLoading}
          >
            Export {transactions.length} Transactions as CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportDataScreen;
