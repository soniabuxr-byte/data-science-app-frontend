import { useState } from 'react';
import { Sparkles, Send, Loader2, BarChart3, Table2, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';
import { aiAPI, analysisAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AIQueryPanelProps {
  data: any[];
  headers: string[];
  tableName: string;
  onDataChange?: (newData: any[]) => void;
}

interface QueryResult {
  answer: string;
  sql_query?: string;
  result_data?: any[];
  insights?: string[];
}

export default function AIQueryPanel({ data, headers, tableName, onDataChange }: AIQueryPanelProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>(headers[0] || '');
  const [columnAnalysis, setColumnAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleQueries = [
    'What are the top 5 rows by value?',
    'Show me the average of each numeric column',
    'Which categories have the highest counts?',
    'Find any outliers in the data',
    'Summarize the key patterns in this dataset'
  ];

  const handleQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await aiAPI.query(tableName, query);
      
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Query completed!');
      } else {
        toast.error(response.error || 'Query failed');
      }
    } catch (error) {
      toast.error('Failed to process query. Make sure the backend is connected.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleColumnAnalysis = async (column: string) => {
    setSelectedColumn(column);
    setIsAnalyzing(true);
    setColumnAnalysis(null);

    try {
      const response = await analysisAPI.getColumnAnalysis(tableName, column);
      
      if (response.success && response.data) {
        setColumnAnalysis(response.data);
      } else {
        toast.error('Analysis failed');
      }
    } catch (error) {
      toast.error('Failed to analyze column');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-purple-600" />
            Ask AI About Your Data
          </CardTitle>
          <CardDescription>
            Ask questions in plain English and get instant insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="e.g., What is the average sales by region? Show me the top 10 products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-500">Try:</span>
              {sampleQueries.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(q)}
                  className="text-xs text-purple-600 hover:text-purple-800 hover:underline"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleQuery}
            disabled={isLoading || !query.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Ask AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Query Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="size-5 text-yellow-500" />
              AI Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-slate-800 whitespace-pre-wrap">{result.answer}</p>
            </div>

            {/* SQL Query (if returned) */}
            {result.sql_query && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Generated SQL:</p>
                <pre className="p-3 bg-slate-100 rounded-lg text-xs overflow-x-auto">
                  {result.sql_query}
                </pre>
              </div>
            )}

            {/* Result Data Table */}
            {result.result_data && result.result_data.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Table2 className="size-4" />
                  Results ({result.result_data.length} rows)
                </p>
                <div className="rounded-md border overflow-auto max-h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(result.result_data[0]).map((key) => (
                          <TableHead key={key} className="bg-slate-50 whitespace-nowrap text-xs">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.result_data.slice(0, 20).map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, i) => (
                            <TableCell key={i} className="whitespace-nowrap text-xs">
                              {value !== null && value !== undefined ? String(value) : '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Insights */}
            {result.insights && result.insights.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Key Insights:</p>
                <ul className="space-y-1">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-purple-500">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Column Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="size-5 text-blue-600" />
              Quick Column Analysis
            </CardTitle>
            <CardDescription>
              Select a column to get instant statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {headers.map((header) => (
                <Button
                  key={header}
                  variant={selectedColumn === header ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleColumnAnalysis(header)}
                  disabled={isAnalyzing}
                  className="text-xs"
                >
                  {header}
                </Button>
              ))}
            </div>
            {isAnalyzing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-blue-600" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column Analysis Results */}
        {columnAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Analysis: {columnAnalysis.column}
              </CardTitle>
              <CardDescription>
                Type: {columnAnalysis.type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {columnAnalysis.statistics && (
                <div className="space-y-2">
                  {Object.entries(columnAnalysis.statistics).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {columnAnalysis.insights && columnAnalysis.insights.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Insights:</p>
                  <ul className="space-y-1">
                    {columnAnalysis.insights.map((insight: string, i: number) => (
                      <li key={i} className="text-xs text-slate-600">• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dataset Overview</CardTitle>
          <CardDescription>
            Your data at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.length.toLocaleString()}</p>
              <p className="text-xs text-slate-600">Total Rows</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{headers.length}</p>
              <p className="text-xs text-slate-600">Columns</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {headers.filter(h => data.some(row => !isNaN(parseFloat(row[h])))).length}
              </p>
              <p className="text-xs text-slate-600">Numeric Cols</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {headers.filter(h => !data.some(row => !isNaN(parseFloat(row[h])))).length}
              </p>
              <p className="text-xs text-slate-600">Text Cols</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
