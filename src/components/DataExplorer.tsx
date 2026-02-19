import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ListOrdered } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DataExplorerProps {
  data: any[];
  headers: string[];
  tableName?: string; // Optional backend table name for enhanced features
}

export default function DataExplorer({ data, headers, tableName }: DataExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      headers.some((header) => {
        const value = row[header];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, headers, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Calculate statistics
  const stats = useMemo(() => {
    const numericColumns = headers.filter((header) => {
      return data.some((row) => {
        const value = row[header];
        return !isNaN(parseFloat(value)) && isFinite(value);
      });
    });

    return {
      totalRows: data.length,
      totalColumns: headers.length,
      numericColumns: numericColumns.length,
      filteredRows: filteredData.length,
    };
  }, [data, headers, filteredData.length]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs sm:text-sm">Total Rows</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{stats.totalRows.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs sm:text-sm">Total Columns</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{stats.totalColumns}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs sm:text-sm">Numeric Columns</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{stats.numericColumns}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs sm:text-sm">Filtered Rows</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">{stats.filteredRows.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>Browse and search your dataset</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => {
                  setRowsPerPage(10);
                  setCurrentPage(1);
                }}
                title="Show top 10 rows"
              >
                <ListOrdered className="mr-2 size-4" />
                Top 10
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {/* Mobile hint */}
          <p className="text-xs text-slate-400 mb-2 sm:hidden">← Swipe to see more columns →</p>
          <div className="rounded-md border overflow-x-auto -mx-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 sm:w-12 bg-slate-50 text-xs sm:text-sm sticky left-0 z-10">#</TableHead>
                  {headers.map((header) => (
                    <TableHead key={header} className="bg-slate-50 whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length + 1} className="text-center py-8 text-slate-500 text-sm">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((row, index) => (
                    <TableRow key={startIndex + index}>
                      <TableCell className="text-slate-500 text-xs sm:text-sm sticky left-0 bg-white z-10">
                        {startIndex + index + 1}
                      </TableCell>
                      {headers.map((header) => (
                        <TableCell key={header} className="whitespace-nowrap text-xs sm:text-sm max-w-[200px] truncate">
                          {row[header] !== undefined && row[header] !== null
                            ? row[header].toString()
                            : '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4">
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <span className="text-xs sm:text-sm text-slate-600">Rows:</span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => {
                  setRowsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 sm:w-20 h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-xs sm:text-sm text-slate-600 min-w-[80px] text-center">
                {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}