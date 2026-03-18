import { useMemo, useState, useRef } from 'react';
import { Database, Edit3, PlusCircle, BarChart3, ArrowLeft, FileSpreadsheet, Upload, Download, Table2, Sparkles, GitMerge } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import DataExplorer from './DataExplorer';
import DataManipulation from './DataManipulation';
import DataAugmentation from './DataAugmentation';
import DataVisualization from './DataVisualization';
import AIQueryPanel from './AIQueryPanel';
import DataJoins from './DataJoins';
import { HelpTooltip } from './HelpTooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { tableAPI } from '../services/api';

// Help tooltip content for each tab
const helpContent = {
  explore: {
    title: 'Explore Data',
    description: 'Browse and search through your dataset in an interactive table.',
    howTo: [
      'View all rows and columns in a paginated table',
      'Use the search bar to find specific values',
      'Click column headers to sort data',
      'See summary statistics for each column'
    ]
  },
  manipulate: {
    title: 'Manipulate Data',
    description: 'Filter, sort, and transform your data to focus on what matters.',
    howTo: [
      'Add filters to show only rows matching your criteria',
      'Sort by multiple columns (ascending or descending)',
      'Remove unwanted rows or reset to original data',
      'Export your filtered results'
    ]
  },
  join: {
    title: 'Join Tables',
    description: 'Combine multiple CSV tables into one for deeper analysis.',
    howTo: [
      'Upload 2–3 CSVs using the upload button in the header',
      'Pick a left and right table',
      'Choose join type (Inner or Left)',
      'Select 1–3 join key pairs and create a new joined table',
    ]
  },
  augment: {
    title: 'Augment Data',
    description: 'Create new columns by combining or calculating from existing ones.',
    howTo: [
      'Create calculated columns (e.g., Profit = Revenue - Cost)',
      'Combine text columns (e.g., Full Name = First + Last)',
      'Extract parts of data (e.g., Year from Date)',
      'Add custom formulas using your column values'
    ]
  },
  visualize: {
    title: 'Visualize Data',
    description: 'Generate charts and graphs to discover patterns in your data.',
    howTo: [
      'Select a chart type (Bar, Line, Pie, Scatter)',
      'Choose which columns to use for X and Y axes',
      'Group data by categories for comparison',
      'Customize colors and labels'
    ]
  },
  ai: {
    title: 'AI Assistant',
    description: 'Ask questions about your data in plain English.',
    howTo: [
      'Ask "What is the average sales by region?"',
      'Ask "Show me the top 10 products by revenue"',
      'Ask "Which customers have the highest orders?"',
      'Get instant insights and visualizations'
    ]
  }
};

type WorkspaceTable = {
  id: string;
  name: string; // display name
  sourceFileName?: string;
  headers: string[];
  rows: any[];
  tableName?: string; // backend table name for AI features
};

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeInitialRows = (rows: any[], headers: string[]) => {
  if (!rows?.length) return [];
  const first = rows[0];
  const isArrayRow = Array.isArray(first);
  if (!isArrayRow && typeof first === 'object' && first !== null) return rows;
  return rows.map((row) => {
    const obj: any = {};
    headers.forEach((header, idx) => {
      obj[header] = Array.isArray(row) ? row[idx] : undefined;
    });
    return obj;
  });
};

export interface DataAppProps {
  onSignOut?: () => void;
  onGoHome?: () => void;
  onBack?: () => void;
  initialData?: any[];
  initialHeaders?: string[];
  initialFileName?: string;
  initialTableName?: string; // Backend table name for AI features
}

export default function DataApp({ onSignOut, onGoHome, onBack, initialData, initialHeaders, initialFileName, initialTableName }: DataAppProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tables, setTables] = useState<WorkspaceTable[]>(() => {
    if (!initialData || !initialHeaders || initialHeaders.length === 0) return [];
    const t: WorkspaceTable = {
      id: makeId(),
      name: initialFileName || 'Table 1',
      sourceFileName: initialFileName || undefined,
      headers: initialHeaders,
      rows: normalizeInitialRows(initialData, initialHeaders),
      tableName: initialTableName,
    };
    return [t];
  });
  const [activeTableId, setActiveTableId] = useState<string | null>(() => (tables[0]?.id ? tables[0].id : null));
  const activeTable = useMemo(() => {
    if (!tables.length) return null;
    const found = tables.find((t) => t.id === activeTableId);
    return found || tables[0];
  }, [tables, activeTableId]);
  const [activeTab, setActiveTab] = useState<string>('explore');

  const updateActiveTable = (updater: (t: WorkspaceTable) => WorkspaceTable) => {
    setTables((prev) =>
      prev.map((t) => (t.id === activeTable?.id ? updater(t) : t))
    );
  };

  const createWorkspaceTable = (t: Omit<WorkspaceTable, 'id'>) => {
    const newTable: WorkspaceTable = { id: makeId(), ...t };
    setTables((prev) => [...prev, newTable]);
    setActiveTableId(newTable.id);
    toast.success(`Added table "${newTable.name}"`);
  };

  // Handle new file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      complete: async (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0] as string[];
          const dataRows = results.data.slice(1).filter((row: any) => 
            row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')
          );
          
          if (dataRows.length === 0) {
            toast.error('CSV file is empty');
            return;
          }

          const processedRows = dataRows.map((row: any) => {
            const obj: any = {};
            headers.forEach((header, idx) => {
              obj[header] = row[idx];
            });
            return obj;
          });

          // Try to upload to backend for AI features
          let newTableName: string | undefined;
          try {
            toast.info('Uploading to AI backend...');
            const uploadResult = await tableAPI.uploadCSV(file);
            if (uploadResult.success && uploadResult.data) {
              newTableName = uploadResult.data.table_name;
              toast.success(`AI features enabled! Loaded ${processedRows.length} rows from ${file.name}`);
            } else {
              toast.success(`Loaded ${processedRows.length} rows from ${file.name}`);
            }
          } catch (error) {
            toast.success(`Loaded ${processedRows.length} rows from ${file.name}`);
          }

          const newTable: WorkspaceTable = {
            id: makeId(),
            name: file.name,
            sourceFileName: file.name,
            headers,
            rows: processedRows,
            tableName: newTableName,
          };
          setTables((prev) => [...prev, newTable]);
          setActiveTableId(newTable.id);
          setActiveTab('explore');
        }
      },
      error: (error) => {
        toast.error(`Error parsing file: ${error.message}`);
      }
    });
    
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Export current data as CSV
  const handleExport = () => {
    if (!activeTable) return;
    const csv = Papa.unparse(activeTable.rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeTable.sourceFileName ? `modified_${activeTable.sourceFileName}` : `export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    // Download is async in some browsers; revoke after it starts.
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 1000);
    toast.success('Data exported successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept=".csv"
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Top row: Back button, Title, Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back button */}
            <div className="flex-shrink-0 w-20 sm:w-24">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="mr-1 size-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              )}
            </div>

            {/* Center: Title */}
            <div className="flex-1 text-center">
              <h1 className="text-blue-600 text-[24px] sm:text-[32px] lg:text-[40px]" style={{ fontFamily: "'Stick No Bills', sans-serif", lineHeight: '1.2' }}>
                Data Science App
              </h1>
            </div>

            {/* Right: Action buttons */}
            <div className="flex-shrink-0 w-20 sm:w-24 flex justify-end gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-blue-600"
                title="Add another CSV"
              >
                <Upload className="size-4" />
              </Button>
              {activeTable && (
                <Button
                  onClick={handleExport}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-green-600"
                  title="Export active table"
                >
                  <Download className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Data summary bar - responsive */}
          {activeTable && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 px-3 sm:px-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-700">
                <FileSpreadsheet className="size-3.5 sm:size-4" />
                <div className="flex items-center gap-2">
                  <span className="font-medium hidden sm:inline">Table</span>
                  <Select value={activeTable.id} onValueChange={(v) => setActiveTableId(v)}>
                    <SelectTrigger className="h-8 w-[180px] bg-white/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="hidden sm:block h-4 w-px bg-blue-200" />
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-600">
                <Table2 className="size-3.5 sm:size-4" />
                <span>{activeTable.rows.length.toLocaleString()} rows</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-blue-200" />
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-600">
                <Database className="size-3.5 sm:size-4" />
                <span>{activeTable.headers.length} cols</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-blue-200" />
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-600">
                <span className="font-medium">{tables.length}</span>
                <span className="text-blue-600/80">tables</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="explore" disabled={!activeTable} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <Database className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">Explore</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.explore} variant="prominent" /></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="manipulate" disabled={!activeTable} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <Edit3 className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">Filter</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.manipulate} variant="prominent" /></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="join" disabled={tables.length < 2} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <GitMerge className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">Join</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.join} variant="prominent" /></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="augment" disabled={!activeTable} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <PlusCircle className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">Add</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.augment} variant="prominent" /></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="visualize" disabled={!activeTable} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <BarChart3 className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">Chart</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.visualize} variant="prominent" /></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="ai" disabled={!activeTable} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <Sparkles className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">AI</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.ai} variant="prominent" /></span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore">
            {activeTable && <DataExplorer data={activeTable.rows} headers={activeTable.headers} tableName={activeTable.tableName} />}
          </TabsContent>

          <TabsContent value="manipulate">
            {activeTable && (
              <DataManipulation
                data={activeTable.rows}
                headers={activeTable.headers}
                tableName={activeTable.tableName}
                onDataChange={(newRows) => updateActiveTable((t) => ({ ...t, rows: newRows }))}
              />
            )}
          </TabsContent>

          <TabsContent value="join">
            <DataJoins
              tables={tables}
              activeTableId={activeTable?.id || null}
              onCreateTable={(t) => createWorkspaceTable(t)}
            />
          </TabsContent>

          <TabsContent value="augment">
            {activeTable && (
              <DataAugmentation
                data={activeTable.rows}
                headers={activeTable.headers}
                tableName={activeTable.tableName}
                onDataChange={(newRows, newHeaders) => updateActiveTable((t) => ({ ...t, headers: newHeaders, rows: newRows }))}
              />
            )}
          </TabsContent>

          <TabsContent value="visualize">
            {activeTable && <DataVisualization data={activeTable.rows} headers={activeTable.headers} tableName={activeTable.tableName} />}
          </TabsContent>

          <TabsContent value="ai">
            {activeTable && (
              <AIQueryPanel
                data={activeTable.rows}
                headers={activeTable.headers}
                tableName={activeTable.tableName}
                onDataChange={(newRows) => updateActiveTable((t) => ({ ...t, rows: newRows }))}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}