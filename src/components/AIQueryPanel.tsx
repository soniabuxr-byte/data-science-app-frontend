import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, BarChart3, Table2, Lightbulb, Mic, MicOff, MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';
import { aiAPI, analysisAPI } from '../services/api';

interface AIQueryPanelProps {
  data: any[];
  headers: string[];
  tableName?: string; // Optional - AI features need backend connection
  onDataChange?: (newData: any[]) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sql_query?: string;
  result_data?: any[];
  insights?: string[];
}

export default function AIQueryPanel({ data, headers, tableName, onDataChange }: AIQueryPanelProps) {
  const makeMessageId = () => {
    // Prefer strong unique IDs for React keys.
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>(headers[0] || '');
  const [columnAnalysis, setColumnAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const currencyFmt = useRef(
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  );
  const intFmt = useRef(new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }));
  const numFmt = useRef(new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }));
  const pFmt = useRef(new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }));

  const isCurrencyColumn = (col: string) => /sales|profit|revenue|amount|price|cost|usd|\$/i.test(col);
  const isCountLike = (keyOrCol: string) => /count|qty|quantity|units/i.test(keyOrCol);

  const toNumber = (v: any) => {
    if (v === null || v === undefined) return NaN;
    const s = String(v).trim();
    if (!s) return NaN;
    const cleaned = s.replace(/[$,]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  };

  const formatStatValue = (column: string, statKey: string, value: any) => {
    const n = typeof value === 'number' ? value : toNumber(value);

    // p-values are always plain numbers between 0 and 1
    if (statKey === 'p_value') {
      if (!Number.isFinite(n)) return String(value);
      return pFmt.current.format(n);
    }

    // Counts are always integers
    if (statKey === 'count' || statKey === 'unique' || statKey.endsWith('_count') || isCountLike(statKey)) {
      if (!Number.isFinite(n)) return String(value);
      return intFmt.current.format(n);
    }

    // Currency formatting for money-like columns
    if (isCurrencyColumn(column)) {
      if (!Number.isFinite(n)) return String(value);
      return currencyFmt.current.format(n);
    }

    // Default numeric formatting
    if (Number.isFinite(n)) return numFmt.current.format(n);
    return String(value);
  };

  // Generate smart suggested questions based on data
  const suggestedQuestions = generateSuggestedQuestions(data, headers);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setQuery(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable it in your browser settings.');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Listening... Speak your question');
    }
  };

  const handleQuery = async (questionText?: string) => {
    const questionToAsk = questionText || query;
    
    if (!questionToAsk.trim()) {
      toast.error('Please enter a question');
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: makeMessageId(),
      role: 'user',
      content: questionToAsk,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    // Check if backend is connected
    if (!tableName) {
      // Provide helpful local analysis instead
      const localAnswer = generateLocalAnswer(questionToAsk, data, headers);
      const assistantMessage: ChatMessage = {
        id: makeMessageId(),
        role: 'assistant',
        content: localAnswer,
        timestamp: new Date(),
        insights: generateLocalInsights(data, headers),
      };
      setChatHistory(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await aiAPI.query(tableName, questionToAsk);
      
      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          id: makeMessageId(),
          role: 'assistant',
          content: response.data.answer,
          timestamp: new Date(),
          sql_query: response.data.sql_query,
          result_data: response.data.result_data,
          insights: response.data.insights,
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: makeMessageId(),
          role: 'assistant',
          content: response.error || 'Sorry, I couldn\'t process that question. Please try rephrasing it.',
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Fall back to local analysis
      const localAnswer = generateLocalAnswer(questionToAsk, data, headers);
      const assistantMessage: ChatMessage = {
        id: makeMessageId(),
        role: 'assistant',
        content: localAnswer,
        timestamp: new Date(),
        insights: generateLocalInsights(data, headers),
      };
      setChatHistory(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  const clearHistory = () => {
    setChatHistory([]);
    toast.success('Chat history cleared');
  };

  const handleColumnAnalysis = async (column: string) => {
    setSelectedColumn(column);
    setIsAnalyzing(true);
    setColumnAnalysis(null);

    // If backend is available, try to use it
    if (tableName) {
      try {
        const response = await analysisAPI.getColumnAnalysis(tableName, column);
        
        if (response.success && response.data) {
          setColumnAnalysis(response.data);
          setIsAnalyzing(false);
          return;
        }
      } catch (error) {
        // Fall through to local analysis
      }
    }

    // Local analysis fallback
    const values = data.map(row => row[column]);
    const numericValues = values.map(v => toNumber(v)).filter(v => Number.isFinite(v));
    const isNumeric = numericValues.length > values.length * 0.5;
    
    const analysis: any = {
      column,
      type: isNumeric ? 'numeric' : 'text',
      statistics: {},
      insights: []
    };

    if (isNumeric && numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const mean = sum / numericValues.length;
      const sorted = [...numericValues].sort((a, b) => a - b);
      const n = numericValues.length;

      // Sample standard deviation
      let stdDev = 0;
      if (n > 1) {
        const variance = numericValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1);
        stdDev = Math.sqrt(variance);
      }

      // Jarque–Bera normality test p-value (approx; JB ~ Chi^2(df=2))
      let pValue: number | null = null;
      if (n >= 3 && stdDev > 0) {
        const m3 = numericValues.reduce((acc, v) => acc + Math.pow(v - mean, 3), 0) / n;
        const m4 = numericValues.reduce((acc, v) => acc + Math.pow(v - mean, 4), 0) / n;
        const s = m3 / Math.pow(stdDev, 3); // skewness
        const k = m4 / Math.pow(stdDev, 4); // kurtosis
        const jb = (n / 6) * (Math.pow(s, 2) + Math.pow(k - 3, 2) / 4);
        pValue = Math.exp(-jb / 2);
      }
      
      analysis.statistics = {
        count: n,
        mean,
        std_dev: stdDev,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        sum,
        median: sorted[Math.floor(sorted.length / 2)],
        ...(pValue !== null ? { p_value: pValue } : {}),
      };
      analysis.insights = [
        `Range: ${formatStatValue(column, 'range', Math.max(...numericValues) - Math.min(...numericValues))}`,
        numericValues.length < values.length ? `${values.length - numericValues.length} non-numeric values found` : 'All values are numeric',
        ...(pValue !== null
          ? [
              `Normality test p-value: ${pFmt.current.format(pValue)} (${pValue < 0.05 ? 'likely not normal' : 'no strong evidence against normality'})`,
            ]
          : []),
      ];
    } else {
      const uniqueValues = new Set(values);
      const valueCounts = new Map<string, number>();
      values.forEach(v => {
        const key = String(v);
        valueCounts.set(key, (valueCounts.get(key) || 0) + 1);
      });
      const mostCommon = [...valueCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      
      analysis.statistics = {
        count: values.length,
        unique: uniqueValues.size,
        most_common: mostCommon ? mostCommon[0] : 'N/A',
        most_common_count: mostCommon ? mostCommon[1] : 0
      };
      analysis.insights = [
        `${uniqueValues.size} unique values out of ${values.length} total`,
        mostCommon ? `"${mostCommon[0]}" appears ${mostCommon[1]} times` : ''
      ].filter(Boolean);
    }

    setColumnAnalysis(analysis);
    setIsAnalyzing(false);
  };

  // Generate follow-up questions based on last response
  const getFollowUpQuestions = (): string[] => {
    if (chatHistory.length === 0) return [];
    
    const lastAssistantMessage = [...chatHistory].reverse().find(m => m.role === 'assistant');
    if (!lastAssistantMessage || !lastAssistantMessage.result_data) return [];

    return [
      'Can you explain this in more detail?',
      'What are the outliers in this result?',
      'Show me a breakdown by category',
      'What trends do you see?',
    ];
  };

  const followUpQuestions = getFollowUpQuestions();

  return (
    <div className="space-y-6">
      {/* Chat Interface */}
      <Card className="flex flex-col h-[500px]">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5 text-purple-600" />
              <CardTitle className="text-lg">AI Data Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-slate-500"
              >
                {showHistory ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
              {chatHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Ask questions about your data in plain English
          </CardDescription>
        </CardHeader>

        {/* Chat History */}
        {showHistory && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="size-12 text-purple-200 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Start a conversation about your data</p>
                
                {/* Suggested Questions */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-medium">Try asking:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.slice(0, 4).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuery(q)}
                        className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* SQL Query */}
                      {message.sql_query && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs font-medium mb-1 text-slate-500">SQL Query:</p>
                          <pre className="text-xs bg-slate-200 p-2 rounded overflow-x-auto">
                            {message.sql_query}
                          </pre>
                        </div>
                      )}
                      
                      {/* Result Data */}
                      {message.result_data && message.result_data.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs font-medium mb-1 text-slate-500">
                            Results ({message.result_data.length} rows):
                          </p>
                          <div className="overflow-x-auto max-h-32 rounded border border-slate-200">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {Object.keys(message.result_data[0]).map((key) => (
                                    <TableHead key={key} className="text-[10px] py-1 px-2 bg-slate-50">
                                      {key}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {message.result_data.slice(0, 5).map((row, idx) => (
                                  <TableRow key={idx}>
                                    {Object.values(row).map((val: any, i) => (
                                      <TableCell key={i} className="text-[10px] py-1 px-2">
                                        {val !== null ? String(val) : '-'}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          {message.result_data.length > 5 && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Showing 5 of {message.result_data.length} rows
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Insights */}
                      {message.insights && message.insights.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs font-medium mb-1 text-slate-500">Insights:</p>
                          <ul className="space-y-0.5">
                            {message.insights.map((insight, i) => (
                              <li key={i} className="text-xs flex items-start gap-1">
                                <Lightbulb className="size-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <p className="text-[10px] mt-2 opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Follow-up Questions */}
                {followUpQuestions.length > 0 && !isLoading && (
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    {followUpQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuery(q)}
                        className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin text-purple-600" />
                        <span className="text-sm text-slate-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-slate-50">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Textarea
                placeholder="Ask a question about your data..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                className="resize-none pr-10 min-h-[40px]"
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${
                  isListening ? 'text-red-500 bg-red-50' : 'text-slate-400'
                }`}
                disabled={isLoading}
              >
                {isListening ? (
                  <MicOff className="size-4" />
                ) : (
                  <Mic className="size-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={() => handleQuery()}
              disabled={isLoading || !query.trim()}
              className="bg-purple-600 hover:bg-purple-700 h-10"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
          {isListening && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... Click mic to stop
            </p>
          )}
        </div>
      </Card>

      {/* Quick Analysis Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Column Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="size-5 text-blue-600" />
              Quick Column Analysis
            </CardTitle>
            <CardDescription>
              Select a column for instant statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {headers.slice(0, 8).map((header) => (
                <Button
                  key={header}
                  variant={selectedColumn === header ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleColumnAnalysis(header)}
                  disabled={isAnalyzing}
                  className="text-xs"
                >
                  {header.length > 12 ? header.substring(0, 12) + '...' : header}
                </Button>
              ))}
              {headers.length > 8 && (
                <span className="text-xs text-slate-400 self-center">+{headers.length - 8} more</span>
              )}
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {columnAnalysis.column}
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
                        {formatStatValue(columnAnalysis.column, key, value)}
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
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                        <Lightbulb className="size-3 text-yellow-500 mt-0.5" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dataset Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dataset Overview</CardTitle>
          <CardDescription>Your data at a glance</CardDescription>
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
              <p className="text-xs text-slate-600">Numeric</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {headers.filter(h => !data.some(row => !isNaN(parseFloat(row[h])))).length}
              </p>
              <p className="text-xs text-slate-600">Text</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to generate smart suggested questions
function generateSuggestedQuestions(data: any[], headers: string[]): string[] {
  const questions: string[] = [];
  
  // Find numeric and text columns
  const numericCols = headers.filter(h => data.some(row => !isNaN(parseFloat(row[h]))));
  const textCols = headers.filter(h => !numericCols.includes(h));
  
  // Generate questions based on data structure
  if (numericCols.length > 0) {
    questions.push(`What is the average ${numericCols[0]}?`);
    questions.push(`Show me the top 10 rows by ${numericCols[0]}`);
  }
  
  if (textCols.length > 0) {
    questions.push(`How many unique ${textCols[0]} are there?`);
    questions.push(`Group the data by ${textCols[0]}`);
  }
  
  if (numericCols.length > 0 && textCols.length > 0) {
    questions.push(`What is the total ${numericCols[0]} by ${textCols[0]}?`);
  }
  
  // Add general questions
  questions.push('Summarize this dataset');
  questions.push('Find any patterns or trends');
  questions.push('What are the key insights?');
  
  return questions;
}

// Generate local answer when backend isn't available
function generateLocalAnswer(question: string, data: any[], headers: string[]): string {
  const q = question.toLowerCase();
  const numericCols = headers.filter(h => data.some(row => !isNaN(parseFloat(row[h]))));
  
  // Handle common questions locally
  if (q.includes('average') || q.includes('mean')) {
    const results: string[] = [];
    numericCols.forEach(col => {
      const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        results.push(`${col}: ${avg.toFixed(2)}`);
      }
    });
    if (results.length > 0) {
      return `Here are the averages for your numeric columns:\n\n${results.join('\n')}`;
    }
  }
  
  if (q.includes('sum') || q.includes('total')) {
    const results: string[] = [];
    numericCols.forEach(col => {
      const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        results.push(`${col}: ${sum.toLocaleString()}`);
      }
    });
    if (results.length > 0) {
      return `Here are the totals for your numeric columns:\n\n${results.join('\n')}`;
    }
  }
  
  if (q.includes('max') || q.includes('highest') || q.includes('top')) {
    const results: string[] = [];
    numericCols.forEach(col => {
      const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const max = Math.max(...values);
        results.push(`${col}: ${max.toLocaleString()}`);
      }
    });
    if (results.length > 0) {
      return `Here are the maximum values:\n\n${results.join('\n')}`;
    }
  }
  
  if (q.includes('min') || q.includes('lowest')) {
    const results: string[] = [];
    numericCols.forEach(col => {
      const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const min = Math.min(...values);
        results.push(`${col}: ${min.toLocaleString()}`);
      }
    });
    if (results.length > 0) {
      return `Here are the minimum values:\n\n${results.join('\n')}`;
    }
  }
  
  if (q.includes('summarize') || q.includes('summary') || q.includes('overview')) {
    return `Dataset Summary:\n\n• Total rows: ${data.length.toLocaleString()}\n• Total columns: ${headers.length}\n• Numeric columns: ${numericCols.length}\n• Text columns: ${headers.length - numericCols.length}\n\nUse the Explore tab to browse your data, or ask me about averages, totals, or specific columns!`;
  }
  
  if (q.includes('unique') || q.includes('distinct')) {
    const results: string[] = [];
    headers.forEach(col => {
      const uniqueValues = new Set(data.map(row => row[col]));
      results.push(`${col}: ${uniqueValues.size} unique values`);
    });
    return `Unique values per column:\n\n${results.join('\n')}`;
  }
  
  // Default response
  return `I analyzed your dataset with ${data.length} rows and ${headers.length} columns.\n\nTry asking me:\n• "What is the average sales?"\n• "Show me the total by category"\n• "Summarize this dataset"\n• "How many unique products are there?"\n\nFor advanced AI queries, upload your CSV using the upload button to enable full AI features!`;
}

// Generate local insights
function generateLocalInsights(data: any[], headers: string[]): string[] {
  const insights: string[] = [];
  const numericCols = headers.filter(h => data.some(row => !isNaN(parseFloat(row[h]))));
  
  insights.push(`Your dataset has ${data.length} rows and ${headers.length} columns`);
  
  if (numericCols.length > 0) {
    const col = numericCols[0];
    const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      insights.push(`Average ${col}: ${avg.toFixed(2)}`);
    }
  }
  
  // Find column with most unique values
  let maxUnique = 0;
  let maxUniqueCol = '';
  headers.forEach(col => {
    const unique = new Set(data.map(row => row[col])).size;
    if (unique > maxUnique) {
      maxUnique = unique;
      maxUniqueCol = col;
    }
  });
  if (maxUniqueCol) {
    insights.push(`"${maxUniqueCol}" has the most variety (${maxUnique} unique values)`);
  }
  
  return insights;
}
