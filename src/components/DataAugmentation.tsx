import { useState } from 'react';
import { Plus, Calculator, Type, Hash, Calendar, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { HelpTooltip, helpTexts } from './HelpTooltip';

interface DataAugmentationProps {
  data: any[];
  headers: string[];
  tableName?: string; // Optional backend table name for AI-powered augmentation
  onDataChange: (newData: any[], newHeaders: string[]) => void;
}

type ColumnType = 'calculated' | 'concatenate' | 'extract' | 'constant';

interface NewColumn {
  id: string;
  name: string;
  type: ColumnType;
  config: any;
}

export default function DataAugmentation({ data, headers, onDataChange }: DataAugmentationProps) {
  const [newColumns, setNewColumns] = useState<NewColumn[]>([]);
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState<ColumnType>('calculated');
  const [calcFormula, setCalcFormula] = useState('');
  const [concatColumns, setConcatColumns] = useState<string[]>([]);
  const [concatSeparator, setConcatSeparator] = useState(' ');
  const [extractColumn, setExtractColumn] = useState('');
  const [extractPattern, setExtractPattern] = useState('');
  const [constantValue, setConstantValue] = useState('');

  const addColumn = () => {
    if (!columnName.trim()) {
      toast.error('Please enter a column name');
      return;
    }

    if (headers.includes(columnName)) {
      toast.error('Column name already exists');
      return;
    }

    const config = {
      calculated: { formula: calcFormula },
      concatenate: { columns: concatColumns, separator: concatSeparator },
      extract: { column: extractColumn, pattern: extractPattern },
      constant: { value: constantValue },
    }[columnType];

    const column: NewColumn = {
      id: Math.random().toString(36).substr(2, 9),
      name: columnName,
      type: columnType,
      config,
    };

    setNewColumns([...newColumns, column]);
    
    // Reset form
    setColumnName('');
    setCalcFormula('');
    setConcatColumns([]);
    setExtractColumn('');
    setExtractPattern('');
    setConstantValue('');
    
    toast.success(`Column "${columnName}" added`);
  };

  const removeColumn = (id: string) => {
    setNewColumns(newColumns.filter((c) => c.id !== id));
  };

  const applyAugmentation = () => {
    if (newColumns.length === 0) {
      toast.error('No columns to add');
      return;
    }

    try {
      const newHeaders = [...headers, ...newColumns.map((c) => c.name)];
      const newData = data.map((row) => {
        const newRow = { ...row };

        newColumns.forEach((column) => {
          try {
            switch (column.type) {
              case 'calculated':
                newRow[column.name] = evaluateFormula(column.config.formula, row);
                break;
              case 'concatenate':
                newRow[column.name] = column.config.columns
                  .map((col: string) => row[col] || '')
                  .join(column.config.separator);
                break;
              case 'extract':
                const value = row[column.config.column]?.toString() || '';
                const match = value.match(new RegExp(column.config.pattern));
                newRow[column.name] = match ? match[0] : '';
                break;
              case 'constant':
                newRow[column.name] = column.config.value;
                break;
            }
          } catch (error) {
            newRow[column.name] = 'ERROR';
          }
        });

        return newRow;
      });

      onDataChange(newData, newHeaders);
      setNewColumns([]);
      toast.success('Data augmentation applied successfully');
    } catch (error) {
      toast.error('Error applying augmentation');
    }
  };

  const evaluateFormula = (formula: string, row: any): any => {
    // Replace column names with their values
    let expression = formula;
    headers.forEach((header) => {
      const value = row[header];
      const numValue = parseFloat(value);
      const safeValue = isNaN(numValue) ? 0 : numValue;
      expression = expression.replace(new RegExp(`\\[${header}\\]`, 'g'), safeValue.toString());
    });

    // Evaluate the expression safely
    try {
      // eslint-disable-next-line no-new-func
      return Function('"use strict"; return (' + expression + ')')();
    } catch (error) {
      return 'ERROR';
    }
  };

  const getColumnIcon = (type: ColumnType) => {
    switch (type) {
      case 'calculated':
        return <Calculator className="size-4" />;
      case 'concatenate':
        return <Type className="size-4" />;
      case 'extract':
        return <Hash className="size-4" />;
      case 'constant':
        return <Calendar className="size-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add New Column */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Column</CardTitle>
            <CardDescription>Create calculated or derived columns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Column Name</Label>
              <Input
                placeholder="Enter column name"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                Column Type
                <HelpTooltip content={{
                  title: 'Column Types',
                  description: 'Choose how to create your new column:',
                  howTo: [
                    'Calculated: Math on existing columns',
                    'Concatenate: Combine text columns',
                    'Extract: Pull out patterns from text',
                    'Constant: Same value for all rows'
                  ]
                }} />
              </Label>
              <Select value={columnType} onValueChange={(value: ColumnType) => setColumnType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calculated">Calculated (Formula)</SelectItem>
                  <SelectItem value="concatenate">Concatenate Columns</SelectItem>
                  <SelectItem value="extract">Extract Pattern</SelectItem>
                  <SelectItem value="constant">Constant Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {columnType === 'calculated' && (
              <div className="space-y-2">
                <Label className="flex items-center">
                  Formula
                  <HelpTooltip content={helpTexts.calculatedColumn} />
                </Label>
                <Textarea
                  placeholder="e.g., [price] * 1.1 or [quantity] + [bonus]"
                  value={calcFormula}
                  onChange={(e) => setCalcFormula(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-slate-500">
                  Use [column_name] to reference columns. Supports +, -, *, /, and parentheses.
                </p>
              </div>
            )}

            {columnType === 'concatenate' && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Columns to Concatenate
                    <HelpTooltip content={helpTexts.concatenateColumn} />
                  </Label>
                  <Select
                    value={concatColumns[0] || ''}
                    onValueChange={(value) => {
                      if (!concatColumns.includes(value)) {
                        setConcatColumns([...concatColumns, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select columns" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {concatColumns.map((col) => (
                      <div
                        key={col}
                        className="bg-slate-100 px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        {col}
                        <button
                          onClick={() => setConcatColumns(concatColumns.filter((c) => c !== col))}
                          className="text-slate-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Separator</Label>
                  <Input
                    placeholder="e.g., space, comma, dash"
                    value={concatSeparator}
                    onChange={(e) => setConcatSeparator(e.target.value)}
                  />
                </div>
              </>
            )}

            {columnType === 'extract' && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Source Column
                    <HelpTooltip content={helpTexts.extractColumn} />
                  </Label>
                  <Select value={extractColumn} onValueChange={setExtractColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pattern (Regex)</Label>
                  <Input
                    placeholder="e.g., \\d+ for numbers"
                    value={extractPattern}
                    onChange={(e) => setExtractPattern(e.target.value)}
                  />
                </div>
              </>
            )}

            {columnType === 'constant' && (
              <div className="space-y-2">
                <Label>Constant Value</Label>
                <Input
                  placeholder="Enter constant value"
                  value={constantValue}
                  onChange={(e) => setConstantValue(e.target.value)}
                />
              </div>
            )}

            <Button onClick={addColumn} className="w-full">
              <Plus className="mr-2 size-4" />
              Add Column
            </Button>
          </CardContent>
        </Card>

        {/* Pending Columns */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Columns</CardTitle>
            <CardDescription>Columns to be added ({newColumns.length})</CardDescription>
          </CardHeader>
          <CardContent>
            {newColumns.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No columns pending</p>
            ) : (
              <div className="space-y-3">
                {newColumns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-start justify-between p-3 border rounded-lg bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getColumnIcon(column.type)}
                        <span className="font-medium">{column.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 capitalize">{column.type}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeColumn(column.id)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button onClick={applyAugmentation} className="w-full" size="lg">
                  Apply All Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>Current dataset structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-slate-50">#</TableHead>
                  {headers.map((header) => (
                    <TableHead key={header} className="bg-slate-50 whitespace-nowrap">
                      {header}
                    </TableHead>
                  ))}
                  {newColumns.map((column) => (
                    <TableHead
                      key={column.id}
                      className="bg-green-50 whitespace-nowrap text-green-700"
                    >
                      {column.name} (new)
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 5).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-slate-500">{index + 1}</TableCell>
                    {headers.map((header) => (
                      <TableCell key={header} className="whitespace-nowrap">
                        {row[header] !== undefined && row[header] !== null
                          ? row[header].toString()
                          : '-'}
                      </TableCell>
                    ))}
                    {newColumns.map((column) => (
                      <TableCell key={column.id} className="whitespace-nowrap text-green-700">
                        Preview
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-slate-500 text-center mt-4">
            Showing first 5 rows. New columns will be calculated for all rows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
