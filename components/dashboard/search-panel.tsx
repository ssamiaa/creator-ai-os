"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAppStore, SearchHit } from "@/lib/store";

function makeMockHits(query: string, files: { id: string; name: string }[]): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return files
    .map((f, i) => ({
      id: `${f.id}-${i}`,
      fileId: f.id,
      filename: f.name,
      chunkLabel: `chunk ${i + 1}`,
      snippet: `Mock context for "${f.name}" related to "${query}". (This becomes real text later.)`,
      score: Math.max(0.4, 0.95 - i * 0.12),
    }))
    .sort((a, b) => b.score - a.score);
}

export function SearchPanel() {
  const files = useAppStore((s) => s.files);
  const query = useAppStore((s) => s.searchQuery);
  const setQuery = useAppStore((s) => s.setSearchQuery);
  const results = useAppStore((s) => s.results);
  const setResults = useAppStore((s) => s.setResults);
  const selectedHitId = useAppStore((s) => s.selectedHitId);
  const selectHit = useAppStore((s) => s.selectHit);

  const selected = useMemo(
    () => results.find((r) => r.id === selectedHitId) ?? null,
    [results, selectedHitId]
  );

  function runSearch(q: string) {
    const hits = makeMockHits(q, files.map((f) => ({ id: f.id, name: f.name })));
    setResults(hits);
    selectHit(null);
  }

  return (
    <div className="p-4 h-full flex flex-col gap-3">
      <div>
        <h2 className="font-semibold">Search</h2>
        <p className="text-sm text-muted-foreground">Semantic search results and context preview.</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search your files..."
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            runSearch(v);
          }}
        />
        <Button
          variant="outline"
          onClick={() => {
            setQuery("");
            setResults([]);
            selectHit(null);
          }}
        >
          Clear
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-[1fr_1fr] gap-3 flex-1 min-h-0">
        <div className="min-h-0 flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">
            {results.length === 0 ? "No results" : `${results.length} result(s)`}
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {results.length === 0 ? (
              <Card className="p-3">
                <div className="text-sm text-muted-foreground">
                  Upload files, then type a query. (This is mock; will replace with vector search.)
                </div>
              </Card>
            ) : (
              results.map((r) => {
                const active = r.id === selectedHitId;
                return (
                  <button key={r.id} onClick={() => selectHit(r.id)} className="w-full text-left">
                    <Card className={`p-3 ${active ? "ring-1 ring-foreground/20" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{r.filename}</div>
                          <div className="text-xs text-muted-foreground">{r.chunkLabel}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(r.score * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {r.snippet}
                      </div>
                    </Card>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="min-h-0 flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">Context</div>
          <div className="flex-1 overflow-auto">
            {selected ? (
              <Card className="p-3">
                <div className="text-sm font-medium">{selected.filename}</div>
                <div className="text-xs text-muted-foreground mb-3">{selected.chunkLabel}</div>
                <div className="text-sm whitespace-pre-wrap">{selected.snippet}</div>
              </Card>
            ) : (
              <Card className="p-3">
                <div className="text-sm text-muted-foreground">
                  Select a result to preview the context.
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
