"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type LocalFile = {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  addedAt: number;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function acceptSupportedFiles(file: File): boolean {
  const allowed = new Set([
    "application/pdf",
    "text/plain",
    "text/markdown",
  ]);
  
  const nameOk = file.name.toLowerCase().endsWith(".md");
  return allowed.has(file.type) || nameOk;
}

export function FilesPanel() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [filter, setFilter] = useState("");
  const [pending, setPending] = useState<File[]>([]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, filter]);

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).filter(acceptSupportedFiles);
    setPending(picked);
  }

  function addPending() {
    if (pending.length === 0) return;

    const next: LocalFile[] = pending.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      type: f.type || (f.name.toLowerCase().endsWith(".md") ? "text/markdown" : "unknown"),
      sizeBytes: f.size,
      addedAt: Date.now(),
    }));

    setFiles((prev) => [...next, ...prev]);
    setPending([]);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="border-r p-4 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Files</h2>
          <p className="text-sm text-muted-foreground">Upload and manage your knowledge base.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Upload</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Add files</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Supported: PDF, TXT, MD.
              </p>

              <Input
                type="file"
                multiple
                accept=".pdf,.txt,.md"
                onChange={(e) => onPickFiles(e.target.files)}
              />

              {pending.length > 0 && (
                <Card className="p-3">
                  <div className="text-sm font-medium mb-2">Selected</div>
                  <div className="space-y-2">
                    {pending.map((f) => (
                      <div key={f.name} className="flex items-center justify-between text-sm">
                        <span className="truncate">{f.name}</span>
                        <span className="text-muted-foreground">{formatBytes(f.size)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPending([])}>
                      Clear
                    </Button>
                    <Button onClick={addPending}>Add to library</Button>
                  </div>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Filter files..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <Separator />

      <div className="flex-1 overflow-auto space-y-2">
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No files yet. Upload a PDF/TXT/MD to get started.
          </div>
        ) : (
          filtered.map((f) => (
            <Card key={f.id} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.type} • {formatBytes(f.sizeBytes)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(f.id)}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Separator />

      <div className="text-xs text-muted-foreground">
        {files.length} file{files.length === 1 ? "" : "s"} in library
      </div>
    </div>
  );
}
