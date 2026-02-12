import { useState, useMemo } from 'react';
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, ScatterChart as ScatterChartIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { HelpTooltip, helpTexts } from './HelpTooltip';
import {
  BarChart,
  Bar,
  LabelList,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataVisualizationProps {
  data: any[];
  headers: string[];
  tableName?: string; // Optional backend table name for AI-powered insights
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];
const TOP_N = 12;
const COUNT_KEY = '__count__';

export default function DataVisualization({ data, headers, tableName }: DataVisualizationProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xAxis, setXAxis] = useState(headers[0] || '');
  const [yAxis, setYAxis] = useState(headers[1] || '');

  const currencyFmt = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    []
  );
  const intFmt = useMemo(() => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }), []);
  const numFmt = useMemo(() => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }), []);

  const isCountMeasure = (col: string) => col === COUNT_KEY;
  const isCurrencyColumn = (col: string) => /sales|profit|revenue|amount|price|cost|usd|\$/i.test(col);
  const isQuantityColumn = (col: string) => isCountMeasure(col) || /qty|quantity|count|units/i.test(col);

  const toNumber = (v: any) => {
    if (v === null || v === undefined) return NaN;
    const s = String(v).trim();
    if (!s) return NaN;
    // Supports "$1,234.56", "1,234", and plain numbers.
    const cleaned = s.replace(/[$,]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  };

  const formatValue = (col: string, value: number) => {
    if (!Number.isFinite(value)) return '';
    if (isCurrencyColumn(col)) return currencyFmt.format(value);
    if (isQuantityColumn(col)) return intFmt.format(value);
    return numFmt.format(value);
  };

  const yAxisLabel = isCountMeasure(yAxis) ? 'Count' : yAxis;

  const getSortKey = (v: any) => {
    const s = (v ?? '').toString();
    const asDate = Date.parse(s);
    if (!Number.isNaN(asDate)) return { kind: 'date' as const, n: asDate };
    const asNum = toNumber(v);
    if (Number.isFinite(asNum)) return { kind: 'num' as const, n: asNum };
    return { kind: 'str' as const, s: s.toLowerCase() };
  };

  // Get numeric and non-numeric columns
  const { numericColumns, categoricalColumns } = useMemo(() => {
    const numeric: string[] = [];
    const categorical: string[] = [];

    headers.forEach((header) => {
      const hasNumeric = data.some((row) => Number.isFinite(toNumber(row?.[header])));

      if (hasNumeric) {
        numeric.push(header);
      } else {
        categorical.push(header);
      }
    });

    return { numericColumns: numeric, categoricalColumns: categorical };
  }, [data, headers]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!xAxis || !yAxis) return [];

    // Aggregate for bar/line/pie (default to SUM)
    if (chartType === 'pie' || chartType === 'bar' || chartType === 'line') {
      const aggregated = new Map<string, { sum: number; count: number }>();

      data.forEach((row) => {
        const key = row?.[xAxis]?.toString() || 'Unknown';
        const cur = aggregated.get(key) || { sum: 0, count: 0 };
        // Always track row count
        cur.count += 1;
        // Track sum only when yAxis is numeric measure
        if (!isCountMeasure(yAxis)) {
          const value = toNumber(row?.[yAxis]);
          if (Number.isFinite(value)) cur.sum += value;
        }
        aggregated.set(key, cur);
      });

      let result = Array.from(aggregated.entries()).map(([name, stats]) => ({
        name,
        value: isCountMeasure(yAxis) ? stats.count : stats.sum,
        _count: stats.count,
      }));

      // For bar/pie: show Top N by value
      if (chartType === 'bar' || chartType === 'pie') {
        result = result.sort((a, b) => b.value - a.value).slice(0, TOP_N);
      }

      // For line: sort by x-axis value if it looks like a date/number
      if (chartType === 'line') {
        result = result.sort((a, b) => {
          const ka = getSortKey(a.name);
          const kb = getSortKey(b.name);
          if (ka.kind === 'date' && kb.kind === 'date') return ka.n - kb.n;
          if (ka.kind === 'num' && kb.kind === 'num') return ka.n - kb.n;
          if (ka.kind === 'str' && kb.kind === 'str') return ka.s.localeCompare(kb.s);
          // Mixed types: keep stable-ish ordering
          const order = { date: 0, num: 1, str: 2 } as const;
          return order[ka.kind] - order[kb.kind];
        });
      }

      return result;
    }

    // Scatter: per-row points
    return data.slice(0, 200).map((row) => ({
      name: row?.[xAxis]?.toString() || '',
      value: isCountMeasure(yAxis) ? 1 : toNumber(row?.[yAxis]) || 0,
      x: toNumber(row?.[xAxis]) || 0,
      y: isCountMeasure(yAxis) ? 1 : toNumber(row?.[yAxis]) || 0,
    }));
  }, [data, xAxis, yAxis, chartType]);

  // Calculate statistics for numeric columns
  const statistics = useMemo(() => {
    return numericColumns.map((column) => {
      const values = data
        .map((row) => toNumber(row?.[column]))
        .filter((val) => Number.isFinite(val));

      if (values.length === 0) return { column, mean: 0, min: 0, max: 0, sum: 0 };

      const sum = values.reduce((acc, val) => acc + val, 0);
      const mean = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      return { column, mean, min, max, sum };
    });
  }, [data, numericColumns]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statistics.slice(0, 4).map((stat) => (
          <Card key={stat.column}>
            <CardHeader className="pb-3">
              <CardDescription>{stat.column}</CardDescription>
              <CardTitle>{formatValue(stat.column, stat.mean) || stat.mean.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Min:</span>
                  <span>{formatValue(stat.column, stat.min) || stat.min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max:</span>
                  <span>{formatValue(stat.column, stat.max) || stat.max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sum:</span>
                  <span>{formatValue(stat.column, stat.sum) || stat.sum.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Visualization Builder
            <HelpTooltip content={helpTexts.chartType} />
          </CardTitle>
          <CardDescription>Create charts and graphs from your data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bar" className="gap-2">
                <BarChart3 className="size-4" />
                <span className="hidden sm:inline">Bar</span>
              </TabsTrigger>
              <TabsTrigger value="line" className="gap-2">
                <LineChartIcon className="size-4" />
                <span className="hidden sm:inline">Line</span>
              </TabsTrigger>
              <TabsTrigger value="pie" className="gap-2">
                <PieChartIcon className="size-4" />
                <span className="hidden sm:inline">Pie</span>
              </TabsTrigger>
              <TabsTrigger value="scatter" className="gap-2">
                <ScatterChartIcon className="size-4" />
                <span className="hidden sm:inline">Scatter</span>
              </TabsTrigger>
            </TabsList>

            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <div className="space-y-2">
                <Label className="flex items-center">
                  X-Axis / Category
                  <HelpTooltip content={helpTexts.xAxis} />
                </Label>
                <Select value={xAxis} onValueChange={setXAxis}>
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
                <Label className="flex items-center">
                  Y-Axis / Value
                  <HelpTooltip content={helpTexts.yAxis} />
                </Label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={COUNT_KEY}>Count (rows)</SelectItem>
                    {numericColumns.length > 0 ? (
                      numericColumns.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))
                    ) : (
                      headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="bar" className="mt-4 sm:mt-6">
              <div className="h-64 sm:h-80 md:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatValue(yAxis, Number(v))} />
                    <Tooltip
                      formatter={(v: any) => formatValue(yAxis, Number(v))}
                      labelFormatter={(label) => `${xAxis}: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#0088FE" name={yAxisLabel}>
                      <LabelList
                        dataKey="value"
                        position="top"
                        formatter={(v: any) => formatValue(yAxis, Number(v))}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="line" className="mt-4 sm:mt-6">
              <div className="h-64 sm:h-80 md:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatValue(yAxis, Number(v))} />
                    <Tooltip
                      formatter={(v: any) => formatValue(yAxis, Number(v))}
                      labelFormatter={(label) => `${xAxis}: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="value" stroke="#00C49F" name={yAxisLabel} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="pie" className="mt-4 sm:mt-6">
              <div className="h-64 sm:h-80 md:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: ${formatValue(yAxis, Number(value)) || ''}`
                      }
                      outerRadius="70%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => formatValue(yAxis, Number(v))}
                      labelFormatter={(label) => `${xAxis}: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="scatter" className="mt-4 sm:mt-6">
              <div className="h-64 sm:h-80 md:h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis dataKey="x" name={xAxis} tick={{ fontSize: 10 }} />
                    <YAxis
                      dataKey="y"
                      name={yAxisLabel}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => formatValue(yAxis, Number(v))}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(v: any) => formatValue(yAxis, Number(v))}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Scatter name={`${xAxis} vs ${yAxis}`} data={chartData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Data Distribution */}
      {categoricalColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>View distribution of categorical data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoricalColumns.slice(0, 3).map((column) => {
                const distribution = new Map<string, number>();
                data.forEach((row) => {
                  const value = row[column]?.toString() || 'Unknown';
                  distribution.set(value, (distribution.get(value) || 0) + 1);
                });

                const sortedDist = Array.from(distribution.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5);

                return (
                  <div key={column}>
                    <h4 className="font-medium mb-2">{column}</h4>
                    <div className="space-y-2">
                      {sortedDist.map(([value, count]) => (
                        <div key={value} className="flex items-center gap-2">
                          <div className="w-32 text-sm text-slate-600 truncate">{value}</div>
                          <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full flex items-center justify-end px-2 text-xs text-white"
                              style={{
                                width: `${(count / data.length) * 100}%`,
                                minWidth: '30px',
                              }}
                            >
                              {count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}