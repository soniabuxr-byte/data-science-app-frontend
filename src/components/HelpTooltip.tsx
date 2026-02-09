import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';

export interface HelpContent {
  title: string;
  description: string;
  howTo?: string[];
  example?: string;
}

interface HelpTooltipProps {
  content: HelpContent;
  size?: 'sm' | 'md';
  variant?: 'default' | 'prominent';
}

export function HelpTooltip({ content, size = 'sm', variant = 'default' }: HelpTooltipProps) {
  const isProminent = variant === 'prominent';
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button 
            className={`
              ml-1.5 transition-all duration-200 focus:outline-none inline-flex items-center rounded-full
              ${isProminent 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 p-0.5' 
                : 'text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-0.5'
              }
            `}
            onClick={(e) => e.stopPropagation()}
            type="button"
            aria-label={`Help: ${content.title}`}
          >
            <Info className={size === 'sm' ? 'size-3.5' : 'size-4'} strokeWidth={2.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          sideOffset={8}
          className="bg-white text-slate-800 border border-slate-200 shadow-xl rounded-lg p-0 max-w-xs z-50"
        >
          <div className="p-4">
            <h4 className="font-semibold text-sm text-blue-600 mb-1">{content.title}</h4>
            <p className="text-xs text-slate-600 mb-2">{content.description}</p>
            
            {content.howTo && content.howTo.length > 0 && (
              <div className="space-y-1.5 mb-2">
                <p className="text-xs font-medium text-slate-700">How to use:</p>
                {content.howTo.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
            
            {content.example && (
              <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Example:</p>
                <code className="text-xs text-blue-700 font-mono">{content.example}</code>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Pre-defined help content for common features
export const helpTexts = {
  // Manipulation
  addFilter: {
    title: 'Add Filter',
    description: 'Filter your data to show only rows that match specific conditions.',
    howTo: [
      'Select a column to filter by',
      'Choose a comparison (equals, contains, greater than, etc.)',
      'Enter the value to compare against',
      'Add multiple filters to narrow down results'
    ],
    example: 'Category "contains" Electronics'
  },
  sorting: {
    title: 'Sort Data',
    description: 'Arrange your data in ascending or descending order based on a column.',
    howTo: [
      'Select the column you want to sort by',
      'Choose ascending (A-Z, 1-9) or descending (Z-A, 9-1)',
      'Click "Apply Changes" to save the sorted order'
    ]
  },
  applyChanges: {
    title: 'Apply Changes',
    description: 'Save your filtered and sorted data. This updates the dataset across all tabs.',
    howTo: [
      'Review the preview to ensure results look correct',
      'Click "Apply Changes" to update your data',
      'The Explore tab will show the updated dataset'
    ]
  },
  
  // Augmentation
  calculatedColumn: {
    title: 'Calculated Column',
    description: 'Create a new column by performing math operations on existing columns.',
    howTo: [
      'Enter a name for your new column',
      'Write a formula using [column_name] syntax',
      'Use +, -, *, / for basic math',
      'Click "Add Column" to queue it'
    ],
    example: '[price] * [quantity] or [revenue] - [cost]'
  },
  concatenateColumn: {
    title: 'Concatenate Columns',
    description: 'Combine text from multiple columns into one.',
    howTo: [
      'Enter a name for your new column',
      'Select the columns to combine',
      'Choose a separator (space, comma, dash, etc.)',
      'Click "Add Column" to queue it'
    ],
    example: 'First Name + " " + Last Name = "John Smith"'
  },
  extractColumn: {
    title: 'Extract Pattern',
    description: 'Pull out specific parts of text using patterns (regex).',
    howTo: [
      'Select the source column',
      'Enter a pattern to match',
      'Common patterns: \\d+ (numbers), [A-Z]+ (letters)'
    ],
    example: 'Extract year from "2024-01-15" using \\d{4}'
  },
  constantColumn: {
    title: 'Constant Value',
    description: 'Add a column where every row has the same value.',
    howTo: [
      'Enter the column name',
      'Enter the value to use for all rows',
      'Useful for tagging data or adding metadata'
    ],
    example: 'Add "Source" column with value "Q1 Report"'
  },
  
  // Visualization
  chartType: {
    title: 'Choose Chart Type',
    description: 'Different charts work better for different data types.',
    howTo: [
      'Bar: Compare categories (sales by region)',
      'Line: Show trends over time',
      'Pie: Show parts of a whole (market share)',
      'Scatter: Find relationships between two numbers'
    ]
  },
  xAxis: {
    title: 'X-Axis / Category',
    description: 'The horizontal axis - usually categories or time.',
    howTo: [
      'For bar/line: Choose a category (product, date, region)',
      'For scatter: Choose a numeric column to compare',
      'For pie: Choose what to group by'
    ]
  },
  yAxis: {
    title: 'Y-Axis / Value',
    description: 'The vertical axis - usually numbers to measure.',
    howTo: [
      'Choose a numeric column (sales, quantity, price)',
      'This is what gets measured or summed',
      'For pie charts, this determines slice sizes'
    ]
  }
};
