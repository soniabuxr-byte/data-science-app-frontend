import { useState, useMemo } from 'react';
import { Filter, SortAsc, SortDesc, Trash2, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';
import Papa from 'papaparse';
import { HelpTooltip, helpTexts } from './HelpTooltip';

interface DataManipulationProps {
  data: any[];
  headers: string[];
  tableName?: string; // Optional backend table name for enhanced features
  onDataChange: (newData: any[]) => void;
}

interface FilterRule {
  id: string;
  column: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'notEmpty' | 'isEmpty';
  value: string;
}

export default function DataManipulation({ data, headers, onDataChange }: DataManipulationProps) {
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Apply filters and sorting
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    filters.forEach((filter) => {
      if (!filter.column || !filter.operator) return;

      result = result.filter((row) => {
        const cellValue = row[filter.column];
        const stringValue = cellValue?.toString().toLowerCase() || '';
        const filterValue = filter.value.toLowerCase();

        switch (filter.operator) {
          case 'equals':
            return stringValue === filterValue;
          case 'contains':
            return stringValue.includes(filterValue);
          case 'greater':
            return parseFloat(cellValue) > parseFloat(filter.value);
          case 'less':
            return parseFloat(cellValue) < parseFloat(filter.value);
          case 'notEmpty':
            return cellValue !== null && cellValue !== undefined && cellValue !== '';
          case 'isEmpty':
            return cellValue === null || cellValue === undefined || cellValue === '';
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (sortColumn && sortColumn !== 'none') {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        // Handle numeric comparison
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Handle string comparison
        const aStr = aVal?.toString() || '';
        const bStr = bVal?.toString() || '';
        const comparison = aStr.localeCompare(bStr);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filters, sortColumn, sortDirection]);

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        id: Math.random().toString(36).substr(2, 9),
        column: headers[0],
        operator: 'contains',
        value: '',
      },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterRule>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const applyChanges = () => {
    onDataChange(processedData);
    toast.success(`Applied changes to ${processedData.length} rows`);
  };

  const exportData = () => {
    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manipulated_data_${Date.now()}.csv`;
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
    <div className="space-y-4 sm:space-y-6">
      {/* Controls */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Filtering */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  Filters
                  <HelpTooltip content={helpTexts.addFilter} />
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Add conditions to filter your data</CardDescription>
              </div>
              <Button onClick={addFilter} size="sm" className="w-full sm:w-auto">
                <Filter className="mr-2 size-4" />
                Add Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {filters.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500 text-center py-4">No filters applied</p>
            ) : (
              filters.map((filter) => (
                <div key={filter.id} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Select
                      value={filter.column}
                      onValueChange={(value) => updateFilter(filter.id, { column: value })}
                    >
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header} className="text-xs sm:text-sm">
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={filter.operator}
                        onValueChange={(value: any) => updateFilter(filter.id, { operator: value })}
                      >
                        <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals" className="text-xs sm:text-sm">Equals</SelectItem>
                          <SelectItem value="contains" className="text-xs sm:text-sm">Contains</SelectItem>
                          <SelectItem value="greater" className="text-xs sm:text-sm">Greater than</SelectItem>
                          <SelectItem value="less" className="text-xs sm:text-sm">Less than</SelectItem>
                          <SelectItem value="notEmpty" className="text-xs sm:text-sm">Not empty</SelectItem>
                          <SelectItem value="isEmpty" className="text-xs sm:text-sm">Is empty</SelectItem>
                        </SelectContent>
                      </Select>
                      {!['notEmpty', 'isEmpty'].includes(filter.operator) && (
                        <Input
                          placeholder="Value"
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          className="text-xs sm:text-sm"
                        />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter(filter.id)}
                    className="mt-1 h-8 w-8 flex-shrink-0"
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sorting */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              Sorting
              <HelpTooltip content={helpTexts.sorting} />
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Sort your data by column</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <Select value={sortColumn} onValueChange={setSortColumn}>
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Select column to sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs sm:text-sm">None</SelectItem>
                {headers.map((header) => (
                  <SelectItem key={header} value={header} className="text-xs sm:text-sm">
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {sortColumn && sortColumn !== 'none' && (
              <div className="flex gap-2">
                <Button
                  variant={sortDirection === 'asc' ? 'default' : 'outline'}
                  onClick={() => setSortDirection('asc')}
                  className="flex-1 text-xs sm:text-sm"
                  size="sm"
                >
                  <SortAsc className="mr-1 sm:mr-2 size-3.5 sm:size-4" />
                  <span className="hidden xs:inline">Ascending</span>
                  <span className="xs:hidden">Asc</span>
                </Button>
                <Button
                  variant={sortDirection === 'desc' ? 'default' : 'outline'}
                  onClick={() => setSortDirection('desc')}
                  className="flex-1 text-xs sm:text-sm"
                  size="sm"
                >
                  <SortDesc className="mr-1 sm:mr-2 size-3.5 sm:size-4" />
                  <span className="hidden xs:inline">Descending</span>
                  <span className="xs:hidden">Desc</span>
                </Button>
              </div>
            )}

            <div className="pt-4 border-t space-y-2">
              <Button onClick={applyChanges} className="w-full text-sm" variant="default">
                Apply Changes
              </Button>
              <Button onClick={exportData} className="w-full text-xs sm:text-sm" variant="outline">
                <Download className="mr-2 size-4" />
                Export Filtered Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Preview</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Showing {processedData.length} of {data.length} rows
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <p className="text-xs text-slate-400 mb-2 sm:hidden">← Swipe to see more columns →</p>
          <div className="rounded-md border overflow-x-auto max-h-80 sm:max-h-96 -mx-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-slate-50 text-xs sm:text-sm sticky left-0 z-10">#</TableHead>
                  {headers.map((header) => (
                    <TableHead key={header} className="bg-slate-50 whitespace-nowrap text-xs sm:text-sm min-w-[80px]">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-slate-500 text-xs sm:text-sm sticky left-0 bg-white z-10">{index + 1}</TableCell>
                    {headers.map((header) => (
                      <TableCell key={header} className="whitespace-nowrap text-xs sm:text-sm max-w-[150px] truncate">
                        {row[header] !== undefined && row[header] !== null
                          ? row[header].toString()
                          : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {processedData.length > 10 && (
            <p className="text-xs sm:text-sm text-slate-500 text-center mt-3 sm:mt-4">
              Showing first 10 rows. Apply changes to see full results in Explore tab.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}