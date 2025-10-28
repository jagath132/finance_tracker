import { supabase } from "../lib/supabase";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  UploadCloud,
  File,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Button from "../components/ui/Button";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import { useAuth } from "../context/AuthContext";

interface ParsedRow {
  [key: string]: string | number;
}

interface TransactionInsert {
  description: string;
  amount: number;
  transaction_date: string;
  type: "income" | "expense";
  category_id: string;
  user_id: string;
}

// Helper function to parse dates from various formats
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Try ISO format first (YYYY-MM-DD)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;

  // Try MM/DD/YYYY
  const mmddyyyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch;
    date = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
    if (!isNaN(date.getTime())) return date;
  }

  // Try DD/MM/YYYY
  const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    date = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
    if (!isNaN(date.getTime())) return date;
  }

  // Try DD-MM-YYYY
  const ddmmyyyyDashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyDashMatch) {
    const [, day, month, year] = ddmmyyyyDashMatch;
    date = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
    if (!isNaN(date.getTime())) return date;
  }

  // Try MM-DD-YYYY
  const mmddyyyyDashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (mmddyyyyDashMatch) {
    const [, month, day, year] = mmddyyyyDashMatch;
    date = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
    if (!isNaN(date.getTime())) return date;
  }

  return null; // Invalid date
};

type MappedField =
  | "date"
  | "description"
  | "amount"
  | "type"
  | "category"
  | "ignore";

interface ColumnMap {
  [key: string]: MappedField;
}

const ImportTransactionsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refetch: refetchCategories } = useCategories();
  const { refetch: refetchTransactions } = useTransactions();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fullParsedData, setFullParsedData] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<ColumnMap>({});
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        preview: 5,
        complete: (results) => {
          setParsedData(results.data as ParsedRow[]);
          const fileHeaders = results.meta.fields || [];
          setHeaders(fileHeaders);
          const initialMap: ColumnMap = {};
          fileHeaders.forEach((header) => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes("date")) initialMap[header] = "date";
            else if (lowerHeader.includes("desc"))
              initialMap[header] = "description";
            else if (lowerHeader.includes("amount"))
              initialMap[header] = "amount";
            else if (lowerHeader.includes("type")) initialMap[header] = "type";
            else if (lowerHeader.includes("cat"))
              initialMap[header] = "category";
            else initialMap[header] = "ignore";
          });
          setColumnMap(initialMap);
        },
      });
      // Parse full data for import
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setFullParsedData(results.data as ParsedRow[]);
        },
      });
    }
  };

  const handleMapChange = (header: string, field: MappedField) => {
    setColumnMap((prev) => ({ ...prev, [header]: field }));
  };

  const isMappingValid = useMemo(() => {
    const mappedValues = Object.values(columnMap);
    return ["date", "description", "amount", "type", "category"].every(
      (field) => mappedValues.includes(field as MappedField)
    );
  }, [columnMap]);

  const handleDownloadSample = () => {
    const sampleData = [
      {
        date: "2025-07-30",
        description: "Groceries",
        category: "Food",
        type: "expense",
        amount: 2500,
      },
      {
        date: "2025-07-29",
        description: "Monthly Salary",
        category: "Salary",
        type: "income",
        amount: 50000,
      },
    ];
    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "cointrail_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!file || !user || fullParsedData.length === 0) return;
    setIsImporting(true);
    const toastId = toast.loading("Starting import...");

    try {
      const fullData = fullParsedData;

      const reverseMap = Object.entries(columnMap).reduce(
        (acc, [header, field]) => {
          if (field !== "ignore") acc[field] = header;
          return acc;
        },
        {} as Record<MappedField, string>
      );

      // Get existing categories
      await refetchCategories(); // Ensure we have latest categories
      const { data: existingCategories } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id);

      const categories = existingCategories || [];
      let processedCount = 0;
      let skippedCount = 0;
      let categoryCount = 0;

      // First pass: collect missing categories
      const categoryNames = new Set(
        categories.map((c) => c.name.toLowerCase())
      );
      const categoriesToCreate: string[] = [];

      for (const row of fullData) {
        const categoryName = row[reverseMap.category]?.trim();
        if (categoryName && !categoryNames.has(categoryName.toLowerCase())) {
          categoryNames.add(categoryName.toLowerCase());
          categoriesToCreate.push(categoryName);
        }
      }

      // Batch create missing categories
      if (categoriesToCreate.length > 0) {
        const categoryInserts = categoriesToCreate.map((name) => ({
          name,
          type: "expense" as const, // Default to expense, can be updated later
          user_id: user.id,
        }));

        const { error: categoryError } = await supabase
          .from("categories")
          .insert(categoryInserts);

        if (categoryError) {
          console.error("Error creating categories:", categoryError);
        } else {
          categoryCount = categoriesToCreate.length;
        }
      }

      // Refetch categories after creating new ones
      const { data: updatedCategories } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id);
      const allCategories = updatedCategories || categories;

      // Prepare transactions for batch insert
      const transactionsToInsert: TransactionInsert[] = [];

      for (const row of fullData) {
        const description = row[reverseMap.description]?.trim();
        const amount = parseFloat(row[reverseMap.amount]);
        const dateStr = row[reverseMap.date]?.trim();
        const type = row[reverseMap.type]?.trim().toLowerCase();
        const categoryName = row[reverseMap.category]?.trim();
        const parsedDate = parseDate(dateStr);

        if (
          description &&
          !isNaN(amount) &&
          amount > 0 &&
          parsedDate &&
          (type === "income" || type === "expense") &&
          categoryName
        ) {
          // Find the category ID
          const category = allCategories.find(
            (c) => c.name.toLowerCase() === categoryName.toLowerCase()
          );

          if (category) {
            transactionsToInsert.push({
              description,
              amount,
              transaction_date: parsedDate.toISOString().split("T")[0],
              type: type as "income" | "expense",
              category_id: category.id,
              user_id: user.id,
            });
            processedCount++;
          } else {
            skippedCount++;
          }
        } else {
          skippedCount++;
        }
      }

      // Batch insert transactions
      if (transactionsToInsert.length > 0) {
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert(transactionsToInsert);

        if (transactionError) {
          console.error("Error importing transactions:", transactionError);
          toast.error(
            "Import failed. Please check your CSV format and try again.",
            { id: toastId, duration: 5000 }
          );
          return;
        }
      }

      // Refetch data to update the UI
      await refetchTransactions();
      await refetchCategories();

      toast.success(
        `Import complete! ${processedCount} transactions added, ${categoryCount} categories created, ${skippedCount} skipped.`,
        { id: toastId, duration: 5000 }
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        "Import failed. Please check your CSV format and try again.",
        { id: toastId, duration: 5000 }
      );
    } finally {
      setIsImporting(false);
    }
  };

  const requiredFields: { value: MappedField; label: string }[] = [
    { value: "date", label: "Date" },
    { value: "description", label: "Description" },
    { value: "amount", label: "Amount" },
    { value: "type", label: "Type (income/expense)" },
    { value: "category", label: "Category Name" },
    { value: "ignore", label: "Ignore this column" },
  ];

  return (
    <div className="min-h-screen bg-dark-primary text-white p-4 sm:p-6 lg:p-8 pb-20">
      <header className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-dark-secondary"
        >
          <ArrowLeft size={24} className="text-gray-400" />
        </button>
        <h1 className="text-xl font-bold">Import Transactions</h1>
        <div className="w-10"></div>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="bg-dark-secondary p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-4">1. Upload CSV File</h2>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-8 text-center mb-4">
            <UploadCloud size={40} className="text-gray-500 mb-3" />
            <h3 className="font-semibold">Drag & drop or click to upload</h3>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="mt-2 text-brand-green font-semibold cursor-pointer hover:underline"
            >
              Choose a file
            </label>
          </div>
          {file && (
            <div className="bg-dark-primary p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File size={20} className="text-gray-400" />
                <span>{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                    setHeaders([]);
                    setColumnMap({});
                  }}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
          <div className="mt-4">
            <Button
              onClick={handleDownloadSample}
              className="bg-gray-700 hover:bg-gray-600 w-auto text-sm py-2"
            >
              Download Sample CSV
            </Button>
          </div>
        </div>

        {file && (
          <div className="bg-dark-secondary p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4">2. Map Columns</h2>
            <p className="text-sm text-gray-400 mb-4">
              Match the columns from your CSV to the required fields.
            </p>
            <div className="space-y-3">
              {headers.map((header) => (
                <div
                  key={header}
                  className="grid grid-cols-2 gap-4 items-center"
                >
                  <span className="font-semibold truncate" title={header}>
                    {header}
                  </span>
                  <select
                    value={columnMap[header]}
                    onChange={(e) =>
                      handleMapChange(header, e.target.value as MappedField)
                    }
                    className="w-full p-2 bg-dark-primary border border-gray-700 rounded-lg text-sm"
                  >
                    {requiredFields.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {file && (
          <div className="bg-dark-secondary p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4">3. Preview & Import</h2>
            {!isMappingValid && (
              <div className="flex items-center gap-3 bg-yellow-900/50 text-yellow-300 p-3 rounded-lg mb-4 text-sm">
                <AlertTriangle size={20} />
                <p>
                  Please map all required fields: Date, Description, Amount,
                  Type, Category.
                </p>
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-dark-primary">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="p-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      {headers.map((h) => (
                        <td key={h} className="p-3 truncate">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-4 rounded-xl text-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <Button
                onClick={handleImport}
                disabled={!isMappingValid || isImporting}
                className="flex-1"
              >
                {isImporting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `Import Transactions`
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ImportTransactionsScreen;
