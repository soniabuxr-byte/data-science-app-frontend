import { useState, useRef } from 'react';
import { Database, Edit3, PlusCircle, BarChart3, ArrowLeft, FileSpreadsheet, Upload, Download, Table2, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import DataExplorer from './DataExplorer';
import DataManipulation from './DataManipulation';
import DataAugmentation from './DataAugmentation';
import DataVisualization from './DataVisualization';
import AIQueryPanel from './AIQueryPanel';
import { HelpTooltip } from './HelpTooltip';
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

interface ParsedData {
  headers: string[];
  rows: any[];
}

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
  const [data, setData] = useState<ParsedData | null>(
    initialData && initialHeaders 
      ? { headers: initialHeaders, rows: initialData.map((row) => {
          const obj: any = {};
          initialHeaders.forEach((header, idx) => {
            obj[header] = row[idx];
          });
          return obj;
        }) }
      : null
  );
  const [fileName, setFileName] = useState<string>(initialFileName || '');
  const [tableName, setTableName] = useState<string | undefined>(initialTableName);
  const [activeTab, setActiveTab] = useState<string>(initialData ? 'explore' : 'explore');

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

          setData({ headers, rows: processedRows });
          setFileName(file.name);
          setTableName(newTableName);
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
    if (!data) return;
    const csv = Papa.unparse(data.rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName ? `modified_${fileName}` : `export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
                Data Science App.com
              </h1>
            </div>

            {/* Right: Action buttons */}
            <div className="flex-shrink-0 w-20 sm:w-24 flex justify-end gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-blue-600"
                title="Upload new CSV"
              >
                <Upload className="size-4" />
              </Button>
              {data && (
                <Button
                  onClick={handleExport}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-green-600"
                  title="Export data"
                >
                  <Download className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Data summary bar - responsive */}
          {data && fileName && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 px-3 sm:px-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-700">
                <FileSpreadsheet className="size-3.5 sm:size-4" />
                <span className="font-medium truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{fileName}</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-blue-200" />
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-600">
                <Table2 className="size-3.5 sm:size-4" />
                <span>{data.rows.length.toLocaleString()} rows</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-blue-200" />
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-blue-600">
                <Database className="size-3.5 sm:size-4" />
                <span>{data.headers.length} cols</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="explore" disabled={!data} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <Database className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">Explore</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.explore} variant="prominent" /></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="manipulate" disabled={!data} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <Edit3 className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">Filter</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.manipulate} variant="prominent" /></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="augment" disabled={!data} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <PlusCircle className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">Add</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.augment} variant="prominent" /></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="visualize" disabled={!data} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <BarChart3 className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">Chart</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.visualize} variant="prominent" /></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="ai" disabled={!data} className="gap-1 flex-col py-2 px-1 sm:px-3 sm:py-3 sm:flex-row sm:gap-2">
              <Sparkles className="size-4 sm:size-5" />
              <div className="flex items-center">
                <span className="text-[10px] sm:text-sm">AI</span>
                <span className="hidden sm:inline-flex"><HelpTooltip content={helpContent.ai} variant="prominent" /></span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore">
            {data && <DataExplorer data={data.rows} headers={data.headers} tableName={tableName} />}
          </TabsContent>

          <TabsContent value="manipulate">
            {data && (
              <DataManipulation
                data={data.rows}
                headers={data.headers}
                tableName={tableName}
                onDataChange={(newRows) => setData({ ...data, rows: newRows })}
              />
            )}
          </TabsContent>

          <TabsContent value="augment">
            {data && (
              <DataAugmentation
                data={data.rows}
                headers={data.headers}
                tableName={tableName}
                onDataChange={(newRows, newHeaders) => setData({ headers: newHeaders, rows: newRows })}
              />
            )}
          </TabsContent>

          <TabsContent value="visualize">
            {data && <DataVisualization data={data.rows} headers={data.headers} tableName={tableName} />}
          </TabsContent>

          <TabsContent value="ai">
            {data && (
              <AIQueryPanel
                data={data.rows}
                headers={data.headers}
                tableName={tableName}
                onDataChange={(newRows) => setData({ ...data, rows: newRows })}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}