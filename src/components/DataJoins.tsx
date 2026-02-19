import { useMemo, useState } from 'react';
import { GitMerge, Plus, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { toast } from 'sonner';

export type WorkspaceTable = {
  id: string;
  name: string;
  sourceFileName?: string;
  headers: string[];
  rows: any[];
  tableName?: string;
};

type JoinType = 'inner' | 'left';

type KeyPair = {
  id: string;
  leftKey: string;
  rightKey: string;
};

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function toKey(row: any, keys: string[]) {
  return keys.map((k) => String(row?.[k] ?? '')).join('␟');
}

function uniqueName(base: string, existing: Set<string>) {
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}_${i}`)) i += 1;
  return `${base}_${i}`;
}

export default function DataJoins({
  tables,
  activeTableId,
  onCreateTable,
}: {
  tables: WorkspaceTable[];
  activeTableId: string | null;
  onCreateTable: (t: Omit<WorkspaceTable, 'id'>) => void;
}) {
  const hasAtLeastTwo = tables.length >= 2;

  const defaultLeft = useMemo(() => activeTableId || tables[0]?.id || '', [activeTableId, tables]);
  const [leftTableId, setLeftTableId] = useState<string>(defaultLeft);
  const [rightTableId, setRightTableId] = useState<string>(() => {
    const firstOther = tables.find((t) => t.id !== defaultLeft)?.id;
    return firstOther || tables[1]?.id || '';
  });
  const [joinType, setJoinType] = useState<JoinType>('inner');
  const [keyPairs, setKeyPairs] = useState<KeyPair[]>(() => [
    { id: makeId(), leftKey: '', rightKey: '' },
  ]);
  const [newTableName, setNewTableName] = useState('Joined table');

  const leftTable = tables.find((t) => t.id === leftTableId) || null;
  const rightTable = tables.find((t) => t.id === rightTableId) || null;

  const canPreview = !!leftTable && !!rightTable && leftTable.id !== rightTable.id && keyPairs.every((p) => p.leftKey && p.rightKey);

  const preview = useMemo(() => {
    if (!canPreview || !leftTable || !rightTable) return null;

    const leftKeys = keyPairs.map((p) => p.leftKey);
    const rightKeys = keyPairs.map((p) => p.rightKey);

    const rightByKey = new Map<string, any[]>();
    rightTable.rows.forEach((r) => {
      const k = toKey(r, rightKeys);
      const arr = rightByKey.get(k);
      if (arr) arr.push(r);
      else rightByKey.set(k, [r]);
    });

    const leftHeaderSet = new Set(leftTable.headers);
    const rightJoinKeySet = new Set(rightKeys);
    const existingOut = new Set<string>(leftTable.headers);
    const rightOutHeaders = rightTable.headers
      .filter((h) => !rightJoinKeySet.has(h))
      .map((h) => uniqueName(leftHeaderSet.has(h) ? `${rightTable.name}_${h}` : h, existingOut));
    rightOutHeaders.forEach((h) => existingOut.add(h));

    let matched = 0;
    let produced = 0;
    const outRows: any[] = [];

    for (const l of leftTable.rows) {
      const lk = toKey(l, leftKeys);
      const rights = rightByKey.get(lk);
      if (rights && rights.length) {
        matched += 1;
        for (const r of rights) {
          const out: any = { ...l };
          rightTable.headers.forEach((h, idx) => {
            if (rightJoinKeySet.has(h)) return;
            const outHeader = rightOutHeaders[idx - [...rightJoinKeySet].filter((k) => k === h).length] ?? null;
            // The mapping above is brittle; instead map by original header list order.
          });
          // Map robustly by walking original headers and consuming rightOutHeaders in order.
          let outIdx = 0;
          for (const h of rightTable.headers) {
            if (rightJoinKeySet.has(h)) continue;
            const outHeader = rightOutHeaders[outIdx++];
            out[outHeader] = r?.[h];
          }
          outRows.push(out);
          produced += 1;
          if (outRows.length >= 10) break;
        }
      } else if (joinType === 'left') {
        const out: any = { ...l };
        for (const h of rightOutHeaders) out[h] = null;
        outRows.push(out);
        produced += 1;
      }
      if (outRows.length >= 10) break;
    }

    // Count full output rows without materializing them all
    let totalRows = 0;
    for (const l of leftTable.rows) {
      const lk = toKey(l, leftKeys);
      const rights = rightByKey.get(lk);
      if (rights && rights.length) totalRows += rights.length;
      else if (joinType === 'left') totalRows += 1;
    }

    const outHeaders = [...leftTable.headers, ...rightOutHeaders];
    return {
      outHeaders,
      sampleRows: outRows,
      totalRows,
      matchedLeftRows: matched,
      leftRows: leftTable.rows.length,
      rightRows: rightTable.rows.length,
      rightAddedCols: rightOutHeaders.length,
    };
  }, [canPreview, joinType, keyPairs, leftTable, rightTable]);

  const createJoin = () => {
    if (!canPreview || !leftTable || !rightTable) {
      toast.error('Select two different tables and choose join keys.');
      return;
    }
    if (!newTableName.trim()) {
      toast.error('Please name the joined table.');
      return;
    }

    const leftKeys = keyPairs.map((p) => p.leftKey);
    const rightKeys = keyPairs.map((p) => p.rightKey);

    const rightByKey = new Map<string, any[]>();
    rightTable.rows.forEach((r) => {
      const k = toKey(r, rightKeys);
      const arr = rightByKey.get(k);
      if (arr) arr.push(r);
      else rightByKey.set(k, [r]);
    });

    const leftHeaderSet = new Set(leftTable.headers);
    const rightJoinKeySet = new Set(rightKeys);
    const existingOut = new Set<string>(leftTable.headers);
    const rightOutHeaders = rightTable.headers
      .filter((h) => !rightJoinKeySet.has(h))
      .map((h) => uniqueName(leftHeaderSet.has(h) ? `${rightTable.name}_${h}` : h, existingOut));
    rightOutHeaders.forEach((h) => existingOut.add(h));

    const outHeaders = [...leftTable.headers, ...rightOutHeaders];

    const outRows: any[] = [];
    for (const l of leftTable.rows) {
      const lk = toKey(l, leftKeys);
      const rights = rightByKey.get(lk);
      if (rights && rights.length) {
        for (const r of rights) {
          const out: any = { ...l };
          let outIdx = 0;
          for (const h of rightTable.headers) {
            if (rightJoinKeySet.has(h)) continue;
            const outHeader = rightOutHeaders[outIdx++];
            out[outHeader] = r?.[h];
          }
          outRows.push(out);
        }
      } else if (joinType === 'left') {
        const out: any = { ...l };
        for (const h of rightOutHeaders) out[h] = null;
        outRows.push(out);
      }
    }

    onCreateTable({
      name: newTableName.trim(),
      sourceFileName: undefined,
      headers: outHeaders,
      rows: outRows,
      tableName: undefined,
    });
    toast.success(`Created "${newTableName.trim()}" (${outRows.length.toLocaleString()} rows)`);
  };

  if (!hasAtLeastTwo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="size-5 text-purple-600" />
            Join Tables
          </CardTitle>
          <CardDescription>Upload at least 2 CSVs to join them.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            Use the upload button in the header to add another CSV. Then come back here to combine tables.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="size-5 text-purple-600" />
            Join Tables
          </CardTitle>
          <CardDescription>Combine 2–3 CSVs with guided joins (inner/left).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Left table</Label>
              <Select value={leftTableId} onValueChange={setLeftTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Right table</Label>
              <Select value={rightTableId} onValueChange={setRightTableId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose table" />
                </SelectTrigger>
                <SelectContent>
                  {tables
                    .filter((t) => t.id !== leftTableId)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Join type</Label>
              <Select value={joinType} onValueChange={(v) => setJoinType(v as JoinType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inner">Inner</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-slate-800">Join keys</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (keyPairs.length >= 3) return;
                  setKeyPairs((prev) => [...prev, { id: makeId(), leftKey: '', rightKey: '' }]);
                }}
                disabled={keyPairs.length >= 3}
              >
                <Plus className="mr-2 size-4" />
                Add key
              </Button>
            </div>

            <div className="space-y-3">
              {keyPairs.map((pair, idx) => (
                <div key={pair.id} className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Left column {keyPairs.length > 1 ? idx + 1 : ''}</Label>
                    <Select
                      value={pair.leftKey}
                      onValueChange={(v) =>
                        setKeyPairs((prev) => prev.map((p) => (p.id === pair.id ? { ...p, leftKey: v } : p)))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a column" />
                      </SelectTrigger>
                      <SelectContent>
                        {(leftTable?.headers || []).map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Right column {keyPairs.length > 1 ? idx + 1 : ''}</Label>
                    <Select
                      value={pair.rightKey}
                      onValueChange={(v) =>
                        setKeyPairs((prev) => prev.map((p) => (p.id === pair.id ? { ...p, rightKey: v } : p)))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a column" />
                      </SelectTrigger>
                      <SelectContent>
                        {(rightTable?.headers || []).map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 items-end">
            <div className="space-y-2">
              <Label>New table name</Label>
              <Input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} placeholder="e.g., Orders + Customers" />
            </div>
            <div className="flex gap-2 justify-start md:justify-end">
              <Button variant="outline" disabled={!canPreview} onClick={() => canPreview && toast.success('Preview updated below')}>
                <Eye className="mr-2 size-4" />
                Preview
              </Button>
              <Button disabled={!canPreview} onClick={createJoin} className="bg-purple-600 hover:bg-purple-700">
                <GitMerge className="mr-2 size-4" />
                Create joined table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>
              Output rows: {preview.totalRows.toLocaleString()} • Added columns: {preview.rightAddedCols} • Left matched rows: {preview.matchedLeftRows.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-500 mb-2">
              Showing up to 10 rows of the joined result.
            </div>
            <div className="rounded-md border overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    {preview.outHeaders.map((h) => (
                      <th key={h} className="text-left font-medium text-slate-600 px-3 py-2 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleRows.map((r, i) => (
                    <tr key={i} className="border-t">
                      {preview.outHeaders.map((h) => (
                        <td key={h} className="px-3 py-2 whitespace-nowrap max-w-[220px] truncate">
                          {r?.[h] === null || r?.[h] === undefined || r?.[h] === '' ? '-' : String(r[h])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {preview.sampleRows.length === 0 && (
                    <tr>
                      <td colSpan={preview.outHeaders.length} className="px-3 py-8 text-center text-slate-500">
                        No rows produced. Try different keys or join type.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

