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

export default function DataVisualization({ data, headers, tableName }: DataVisualizationProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xAxis, setXAxis] = useState(headers[0] || '');
  const [yAxis, setYAxis] = useState(headers[1] || '');

  // Get numeric and non-numeric columns
  const { numericColumns, categoricalColumns } = useMemo(() => {
    const numeric: string[] = [];
    const categorical: string[] = [];

    headers.forEach((header) => {
      const hasNumeric = data.some((row) => {
        const value = row[header];
        return !isNaN(parseFloat(value)) && isFinite(value);
      });

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

    // For pie chart, aggregate data
    if (chartType === 'pie') {
      const aggregated = new Map<string, number>();

      data.forEach((row) => {
        const key = row[xAxis]?.toString() || 'Unknown';
        const value = parseFloat(row[yAxis]) || 0;
        aggregated.set(key, (aggregated.get(key) || 0) + value);
      });

      return Array.from(aggregated.entries())
        .map(([name, value]) => ({ name, value }))
        .slice(0, 10); // Limit to 10 slices for readability
    }

    // For other charts
    return data.slice(0, 50).map((row) => ({
      name: row[xAxis]?.toString() || '',
      value: parseFloat(row[yAxis]) || 0,
      x: parseFloat(row[xAxis]) || 0,
      y: parseFloat(row[yAxis]) || 0,
    }));
  }, [data, xAxis, yAxis, chartType]);

  // Calculate statistics for numeric columns
  const statistics = useMemo(() => {
    return numericColumns.map((column) => {
      const values = data
        .map((row) => parseFloat(row[column]))
        .filter((val) => !isNaN(val));

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
              <CardTitle>{stat.mean.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Min:</span>
                  <span>{stat.min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max:</span>
                  <span>{stat.max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sum:</span>
                  <span>{stat.sum.toFixed(2)}</span>
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
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#0088FE" name={yAxis} />
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
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="value" stroke="#00C49F" name={yAxis} />
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
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius="70%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
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
                    <YAxis dataKey="y" name={yAxis} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
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