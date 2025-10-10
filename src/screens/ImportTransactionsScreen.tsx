import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UploadCloud, File, AlertTriangle, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';

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
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(date.getTime())) return date;
    }

    // Try DD/MM/YYYY
    const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(date.getTime())) return date;
    }

    // Try DD-MM-YYYY
    const ddmmyyyyDashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyyDashMatch) {
        const [, day, month, year] = ddmmyyyyDashMatch;
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(date.getTime())) return date;
    }

    // Try MM-DD-YYYY
    const mmddyyyyDashMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (mmddyyyyDashMatch) {
        const [, month, day, year] = mmddyyyyDashMatch;
        date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(date.getTime())) return date;
    }

    return null; // Invalid date
};

type MappedField = 'date' | 'description' | 'amount' | 'type' | 'category' | 'ignore';

interface ColumnMap {
    [key: string]: MappedField;
}

const ImportTransactionsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { refetch: refetchCategories } = useCategories();
    const { refetch: refetchTransactions } = useTransactions();

    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
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
                    setParsedData(results.data);
                    const fileHeaders = results.meta.fields || [];
                    setHeaders(fileHeaders);
                    const initialMap: ColumnMap = {};
                    fileHeaders.forEach(header => {
                        const lowerHeader = header.toLowerCase();
                        if (lowerHeader.includes('date')) initialMap[header] = 'date';
                        else if (lowerHeader.includes('desc')) initialMap[header] = 'description';
                        else if (lowerHeader.includes('amount')) initialMap[header] = 'amount';
                        else if (lowerHeader.includes('type')) initialMap[header] = 'type';
                        else if (lowerHeader.includes('cat')) initialMap[header] = 'category';
                        else initialMap[header] = 'ignore';
                    });
                    setColumnMap(initialMap);
                },
            });
        }
    };
    
    const handleMapChange = (header: string, field: MappedField) => {
        setColumnMap(prev => ({ ...prev, [header]: field }));
    };

    const isMappingValid = useMemo(() => {
        const mappedValues = Object.values(columnMap);
        return ['date', 'description', 'amount', 'type', 'category'].every(field => mappedValues.includes(field as MappedField));
    }, [columnMap]);

    const handleDownloadSample = () => {
        const sampleData = [
            { date: '2025-07-30', description: 'Groceries', category: 'Food', type: 'expense', amount: 2500 },
            { date: '2025-07-29', description: 'Monthly Salary', category: 'Salary', type: 'income', amount: 50000 },
        ];
        const csv = Papa.unparse(sampleData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "cointrail_sample.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async () => {
        if (!file || !user) return;
        setIsImporting(true);
        const toastId = toast.loading('Starting import...');

        try {
            // 1. Fetch all existing categories for the user
            const { data: existingCategoriesData, error: fetchError } = await supabase
                .from('categories')
                .select('id, name, type')
                .eq('user_id', user.id);

            if (fetchError) throw new Error(`Failed to fetch categories: ${fetchError.message}`);

            const existingCategoriesSet = new Set(existingCategoriesData.map(c => `${c.name.toLowerCase()}|${c.type}`));
            let categoryMap = new Map(existingCategoriesData.map(c => [`${c.name.toLowerCase()}|${c.type}`, c.id]));

            // 2. Parse the entire CSV file
            const fullData: any[] = await new Promise((resolve) => {
                Papa.parse(file, { header: true, skipEmptyLines: true, complete: (results) => resolve(results.data) });
            });
            toast.loading(`Processing ${fullData.length} rows...`, { id: toastId });

            const reverseMap = Object.entries(columnMap).reduce((acc, [header, field]) => {
                if (field !== 'ignore') acc[field] = header;
                return acc;
            }, {} as Record<MappedField, string>);

            // 3. Identify new categories that need to be created
            const newCategoriesToCreate = new Map<string, { name: string, type: 'income' | 'expense' }>();
            for (const row of fullData) {
                const categoryName = row[reverseMap.category]?.trim();
                const type = row[reverseMap.type]?.toLowerCase().trim() as 'income' | 'expense';

                if (categoryName && type && (type === 'income' || type === 'expense')) {
                    const uniqueKey = `${categoryName.toLowerCase()}|${type}`;
                    if (!existingCategoriesSet.has(uniqueKey) && !newCategoriesToCreate.has(uniqueKey)) {
                        newCategoriesToCreate.set(uniqueKey, { name: categoryName, type });
                    }
                }
            }
            
            // 4. Batch-insert new categories if any
            if (newCategoriesToCreate.size > 0) {
                toast.loading(`Creating ${newCategoriesToCreate.size} new categories...`, { id: toastId });
                const newCategoryPayload = Array.from(newCategoriesToCreate.values()).map(cat => ({ ...cat, user_id: user.id }));
                
                const { data: createdCategories, error: catError } = await supabase.from('categories').insert(newCategoryPayload).select();
                if (catError) throw new Error(`Failed to create categories: ${catError.message}`);

                // Add newly created categories to our map
                createdCategories.forEach(c => categoryMap.set(`${c.name.toLowerCase()}|${c.type}`, c.id));
            }

            // 5. Prepare and batch-insert transactions
            toast.loading(`Preparing ${fullData.length} transactions for import...`, { id: toastId });
            const transactionsToInsert = [];
            let skippedCount = 0;
            for (const row of fullData) {
                const categoryName = row[reverseMap.category]?.trim();
                const type = row[reverseMap.type]?.toLowerCase().trim() as 'income' | 'expense';
                const amount = parseFloat(row[reverseMap.amount]);
                const description = row[reverseMap.description]?.trim();
                const dateStr = row[reverseMap.date]?.trim();
                const parsedDate = parseDate(dateStr);

                const categoryId = categoryMap.get(`${categoryName.toLowerCase()}|${type}`);

                if (description && !isNaN(amount) && amount > 0 && parsedDate && categoryId) {
                    transactionsToInsert.push({
                        user_id: user.id,
                        description,
                        amount,
                        type,
                        category_id: categoryId,
                        transaction_date: parsedDate.toISOString(),
                        notes: row['notes'] || null
                    });
                } else {
                    skippedCount++;
                }
            }

            if (transactionsToInsert.length > 0) {
                toast.loading(`Importing ${transactionsToInsert.length} transactions...`, { id: toastId });
                const { error: txError } = await supabase.from('transactions').insert(transactionsToInsert);
                if (txError) throw new Error(`Failed to insert transactions: ${txError.message}`);
            }

            await refetchTransactions();
            await refetchCategories();
            toast.success(`Import complete! ${transactionsToInsert.length} transactions added, ${skippedCount} skipped.`, { id: toastId, duration: 5000 });
            navigate('/dashboard');

        } catch (error: any) {
            toast.error(error.message, { id: toastId, duration: 5000 });
        } finally {
            setIsImporting(false);
        }
    };

    const requiredFields: { value: MappedField, label: string }[] = [
        { value: 'date', label: 'Date' },
        { value: 'description', label: 'Description' },
        { value: 'amount', label: 'Amount' },
        { value: 'type', label: 'Type (income/expense)' },
        { value: 'category', label: 'Category Name' },
        { value: 'ignore', label: 'Ignore this column' },
    ];

    return (
        <div className="min-h-screen bg-dark-primary text-white p-4 sm:p-6">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-dark-secondary">
                    <ArrowLeft size={24} className="text-gray-400" />
                </button>
                <h1 className="text-xl font-bold">Import Transactions</h1>
                <div className="w-10"></div>
            </header>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-dark-secondary p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-4">1. Upload CSV File</h2>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-8 text-center mb-4">
                        <UploadCloud size={40} className="text-gray-500 mb-3" />
                        <h3 className="font-semibold">Drag & drop or click to upload</h3>
                        <input type="file" id="file-upload" className="hidden" accept=".csv" onChange={handleFileChange} />
                        <label htmlFor="file-upload" className="mt-2 text-brand-green font-semibold cursor-pointer hover:underline">
                            Choose a file
                        </label>
                    </div>
                    {file && (
                        <div className="bg-dark-primary p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3"><File size={20} className="text-gray-400" /><span>{file.name}</span></div>
                            <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                        </div>
                    )}
                     <div className="mt-4">
                        <Button onClick={handleDownloadSample} className="bg-gray-700 hover:bg-gray-600 w-auto text-sm py-2">Download Sample CSV</Button>
                    </div>
                </div>

                {file && (
                    <div className="bg-dark-secondary p-6 rounded-2xl">
                        <h2 className="text-lg font-bold mb-4">2. Map Columns</h2>
                        <p className="text-sm text-gray-400 mb-4">Match the columns from your CSV to the required fields.</p>
                        <div className="space-y-3">
                            {headers.map(header => (
                                <div key={header} className="grid grid-cols-2 gap-4 items-center">
                                    <span className="font-semibold truncate" title={header}>{header}</span>
                                    <select value={columnMap[header]} onChange={(e) => handleMapChange(header, e.target.value as MappedField)} className="w-full p-2 bg-dark-primary border border-gray-700 rounded-lg text-sm">
                                        {requiredFields.map(field => <option key={field.value} value={field.value}>{field.label}</option>)}
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
                                <p>Please map all required fields: Date, Description, Amount, Type, Category.</p>
                            </div>
                        )}
                        <div className="overflow-x-auto rounded-lg border border-gray-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-dark-primary">
                                    <tr>{headers.map(h => <th key={h} className="p-3">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {parsedData.map((row, i) => (
                                        <tr key={i} className="border-t border-gray-700">
                                            {headers.map(h => <td key={h} className="p-3 truncate">{row[h]}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6">
                            <Button onClick={handleImport} disabled={!isMappingValid || isImporting} className="w-full">
                                {isImporting ? <Loader2 className="animate-spin" /> : `Import Transactions`}
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ImportTransactionsScreen;
