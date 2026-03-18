import { Upload, Database, Edit3, PlusCircle, BarChart3, ArrowRight, ArrowLeft, FileSpreadsheet, Globe, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { tableAPI } from '../services/api';

interface LandingPageProps {
  onGetStarted: (data: any[], headers: string[], fileName: string, tableName?: string) => void;
  onBack?: () => void;
}

export default function LandingPage({ onGetStarted, onBack }: LandingPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [kaggleUrl, setKaggleUrl] = useState('');
  const [isLoadingKaggle, setIsLoadingKaggle] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [showKaggleView, setShowKaggleView] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  // Process uploaded file - uploads to backend for AI features
  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 100MB');
      return;
    }

    // First, parse locally for immediate display
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

          // Try to upload to backend for AI features
          let tableName: string | undefined;
          try {
            toast.info('Uploading to AI backend...');
            const uploadResult = await tableAPI.uploadCSV(file);
            if (uploadResult.success && uploadResult.data) {
              tableName = uploadResult.data.table_name;
              toast.success(`AI features enabled! Loaded ${dataRows.length} rows`);
            } else {
              // Backend upload failed, but we can still work locally
              toast.success(`Loaded ${dataRows.length} rows (local mode)`);
            }
          } catch (error) {
            // Backend unavailable, continue in local-only mode
            toast.success(`Loaded ${dataRows.length} rows (local mode)`);
          }

          onGetStarted(dataRows, headers, file.name, tableName);
        } else {
          toast.error('Failed to parse CSV file');
        }
      },
      error: (error) => {
        toast.error(`Error parsing file: ${error.message}`);
      }
    });
  };

  // Load sample data
  const handleLoadSampleData = async () => {
    setIsLoadingSample(true);
    try {
      const response = await fetch('/sample-data.csv');
      const csvText = await response.text();
      const blob = new Blob([csvText], { type: 'text/csv' });
      const file = new File([blob], 'sample-data.csv', { type: 'text/csv' });
      
      Papa.parse(csvText, {
        complete: async (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0] as string[];
            const dataRows = results.data.slice(1).filter((row: any) => 
              row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')
            );
            
            // Try to upload to backend for AI features
            let tableName: string | undefined;
            try {
              const uploadResult = await tableAPI.uploadCSV(file);
              if (uploadResult.success && uploadResult.data) {
                tableName = uploadResult.data.table_name;
                toast.success(`AI features enabled! Loaded sample dataset with ${dataRows.length} rows`);
              } else {
                toast.success(`Loaded sample dataset with ${dataRows.length} rows`);
              }
            } catch (error) {
              toast.success(`Loaded sample dataset with ${dataRows.length} rows`);
            }
            
            onGetStarted(dataRows, headers, 'sample-data.csv', tableName);
          }
        },
        error: (error) => {
          toast.error(`Error loading sample data: ${error.message}`);
        }
      });
    } catch (error) {
      toast.error('Failed to load sample data');
    } finally {
      setIsLoadingSample(false);
    }
  };

  // Import from Kaggle
  const handleKaggleImport = async () => {
    if (!kaggleUrl.trim()) {
      toast.error('Please enter a Kaggle dataset URL');
      return;
    }

    // Extract dataset path from Kaggle URL
    // Formats: 
    // - https://www.kaggle.com/datasets/username/dataset-name
    // - https://www.kaggle.com/username/dataset-name
    // - username/dataset-name
    let datasetPath = kaggleUrl.trim();
    
    // Remove common Kaggle URL prefixes
    datasetPath = datasetPath.replace('https://www.kaggle.com/datasets/', '');
    datasetPath = datasetPath.replace('https://www.kaggle.com/', '');
    datasetPath = datasetPath.replace('http://www.kaggle.com/datasets/', '');
    datasetPath = datasetPath.replace('http://www.kaggle.com/', '');
    datasetPath = datasetPath.replace('kaggle.com/datasets/', '');
    datasetPath = datasetPath.replace('kaggle.com/', '');
    
    // Remove trailing slashes and query params
    datasetPath = datasetPath.split('?')[0].replace(/\/$/, '');

    if (!datasetPath.includes('/')) {
      toast.error('Invalid Kaggle URL. Use format: username/dataset-name');
      return;
    }

    setIsLoadingKaggle(true);
    
    try {
      // Use a CORS proxy to fetch from Kaggle
      // Note: For production, you'd want to handle this on your backend
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.kaggle.com/datasets/${datasetPath}/download?datasetVersionNumber=1`)}`;
      
      toast.info('Attempting to fetch Kaggle dataset... This may take a moment.');
      
      // Alternative approach: Direct users to download and upload
      toast.error(
        'Direct Kaggle import requires authentication. Please download the dataset from Kaggle and upload the CSV file.',
        { duration: 5000 }
      );
      
      // Open Kaggle page in new tab
      window.open(`https://www.kaggle.com/datasets/${datasetPath}`, '_blank');
      
    } catch (error) {
      toast.error('Failed to import from Kaggle. Please download and upload manually.');
    } finally {
      setIsLoadingKaggle(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Kaggle Import View
  if (showKaggleView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
        {/* Back Button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <Button
            onClick={() => setShowKaggleView(false)}
            variant="outline"
            size="sm"
            className="shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="mr-2 size-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl mx-auto">
            {/* Kaggle Import Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">Import from Kaggle</h3>
                  <p className="text-slate-500 text-sm">Paste a Kaggle dataset URL to import</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="https://www.kaggle.com/datasets/username/dataset-name"
                  value={kaggleUrl}
                  onChange={(e) => setKaggleUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleKaggleImport}
                  disabled={isLoadingKaggle}
                  className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                >
                  {isLoadingKaggle ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Globe className="w-4 h-4 mr-2" />
                  )}
                  Open in Kaggle
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Tip:</strong> Kaggle requires authentication to download datasets. 
                  Click "Open in Kaggle" to view the dataset, then download the CSV and upload it here.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-purple-600">Popular datasets:</span>
                  <button 
                    onClick={() => setKaggleUrl('https://www.kaggle.com/datasets/kyanyoga/sample-sales-data')}
                    className="text-xs text-purple-700 hover:underline"
                  >
                    Sales Data
                  </button>
                  <span className="text-purple-300">•</span>
                  <button 
                    onClick={() => setKaggleUrl('https://www.kaggle.com/datasets/arnabchaki/indian-restaurants-2023')}
                    className="text-xs text-purple-700 hover:underline"
                  >
                    Restaurants
                  </button>
                  <span className="text-purple-300">•</span>
                  <button 
                    onClick={() => setKaggleUrl('https://www.kaggle.com/datasets/shivamb/netflix-shows')}
                    className="text-xs text-purple-700 hover:underline"
                  >
                    Netflix Shows
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input for after Kaggle download */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          accept=".csv"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Back Button */}
      {onBack && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="mr-2 size-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-[#1976d2] text-[32px] sm:text-[40px] lg:text-[48px] mb-4 sm:mb-6" style={{ fontFamily: "'Stick No Bills', sans-serif", lineHeight: '56px', letterSpacing: '0px' }}>
              Data Science Apps
            </h1>
            <p className="text-slate-600 text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto">
              Analyze, Transform, Visualize — Visually
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12">
            {/* Feature Steps */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <span className="text-xl sm:text-2xl">1</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    <h3 className="text-lg sm:text-xl">Explore Data</h3>
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base">
                    View and browse your data in a clean, interactive table format with search and pagination
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <span className="text-xl sm:text-2xl">2</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    <h3 className="text-lg sm:text-xl">Manipulate Data</h3>
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Filter rows, sort columns, and transform your dataset with powerful tools
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                  <span className="text-xl sm:text-2xl">3</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    <h3 className="text-lg sm:text-xl">Augment Data</h3>
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Create calculated columns, concatenate fields, and derive new insights
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                  <span className="text-xl sm:text-2xl">4</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    <h3 className="text-lg sm:text-xl">Visualize Data</h3>
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Generate beautiful charts and graphs to understand your data patterns
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Your Data Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-4 sm:mb-6">
                Get Started with Data
              </h2>
              <p className="text-slate-600 text-base sm:text-lg mb-6 sm:mb-8">
                Upload your own CSV, try our sample data, or import from Kaggle
              </p>
              
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 sm:p-12 mb-8 cursor-pointer
                  transition-all duration-200 ease-in-out
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                    : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-colors
                    ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}
                  `}>
                    <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className={`text-lg font-medium ${isDragging ? 'text-blue-600' : 'text-slate-700'}`}>
                      {isDragging ? 'Drop your file here' : 'Drag & drop your CSV file here'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      or <span className="text-blue-600 font-medium">click to browse</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    Supports CSV files up to 100MB
                  </p>
                </div>
              </div>

              {/* Alternative Options */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-sm text-slate-500 font-medium">or choose another option</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Two Other Options */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Option 2: Sample Data */}
                <div className="bg-slate-50 rounded-xl p-4 sm:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium">Try Sample Data</h4>
                      <p className="text-slate-500 text-xs">50 rows of sales data to explore</p>
                    </div>
                    <Button
                      onClick={handleLoadSampleData}
                      disabled={isLoadingSample}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoadingSample ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Load'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Option 3: Kaggle Import */}
                <div className="bg-slate-50 rounded-xl p-4 sm:p-6 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-medium">Browse Kaggle</h4>
                      <p className="text-slate-500 text-xs">Import from public datasets</p>
                    </div>
                    <Button
                      onClick={() => setShowKaggleView(true)}
                      size="sm"
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      Browse
                    </Button>
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".csv"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg mb-2">Easy Upload</h3>
              <p className="text-slate-600 text-sm">
                Simple drag-and-drop or click to upload your CSV files
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Edit3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg mb-2">Powerful Tools</h3>
              <p className="text-slate-600 text-sm">
                Advanced filtering, sorting, and data manipulation capabilities
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg mb-2">Rich Visualizations</h3>
              <p className="text-slate-600 text-sm">
                Create stunning charts including bar, line, pie, and scatter plots
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center">
            <p className="text-slate-500 text-sm sm:text-base mb-4">
              No installation required • Works in your browser • Free to use
            </p>
            <Button
              onClick={onGetStarted}
              variant="outline"
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Start Analyzing Your Data
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}