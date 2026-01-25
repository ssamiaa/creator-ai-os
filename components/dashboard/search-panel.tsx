"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type SearchHit = {
  id: string;
  filename: string;
  score: number; 
  snippet: string;
  sourceLabel: string; 
};

// temporary mock results generator
function mockSearch(query: string): SearchHit[] {
  const q = query.trim();
  if (!q) return [];
  const base = [
    {
      filename: "notes.md",
      snippet: "Key ideas about the project scope, MVP, and constraints...",
      sourceLabel: "chunk 3",
    },
    {
      filename: "paper.pdf",
      snippet: "Introduction: This paper proposes a method for...",
      sourceLabel: "chunk 12",
    },
    {
      filename: "todo.txt",
      snippet: "Ship v0.1: ingestion, search, chat with citations, cost...",
      sourceLabel: "chunk 1",
    },
  ];

  // deterministic-ish scoring 
  return base
    .map((x, i) => ({
      id: `${x.filename}-${i}`,
      filename: x.filename,
      snippet: x.snippet,
      sourceLabel: x.sourceLabel,
      score: Math.max(0.35, Math.min(0.98, 0.92 - i * 0.12 + (q.length % 5) * 0.01)),
    }))
    .sort((a, b) => b.score - a.score);
}

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => mockSearch(query), [query]);
  const selected = useMemo(
    () => results.find((r) => r.id === selectedId) ?? null,
    [results, selectedId]
  );

  return (
    <div className="p-4 h-full flex flex-col gap-3">
      <div>
        <h2 className="font-semibold">Search</h2>
        <p className="text-sm text-muted-foreground">
          Semantic search results and context preview.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search your files..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedId(null);
          }}
        />
        <Button
          variant="outline"
          onClick={() => {
            setQuery("");
            setSelectedId(null);
          }}
        >
          Clear
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-[1fr_1fr] gap-3 flex-1 min-h-0">
        {/* Results */}
        <div className="min-h-0 flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">
            {results.length === 0 ? "No results" : `${results.length} result(s)`}
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {results.length === 0 ? (
              <Card className="p-3">
                <div className="text-sm text-muted-foreground">
                  Type a query to see results. (We’ll replace this mock with vector search.)
                </div>
              </Card>
            ) : (
              results.map((r) => {
                const active = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className="w-full text-left"
                  >
                    <Card className={`p-3 ${active ? "ring-1 ring-foreground/20" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{r.filename}</div>
                          <div className="text-xs text-muted-foreground">{r.sourceLabel}</div>
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

        {/* Context preview */}
        <div className="min-h-0 flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">Context</div>
          <div className="flex-1 overflow-auto">
            {selected ? (
              <Card className="p-3">
                <div className="text-sm font-medium">{selected.filename}</div>
                <div className="text-xs text-muted-foreground mb-3">{selected.sourceLabel}</div>
                <div className="text-sm whitespace-pre-wrap">
                  {selected.snippet}
                  {"\n\n"}
                  {"(Later: this becomes the full chunk text with surrounding context.)"}
                </div>
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
