import { create } from "zustand";

export type LibraryFile = {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  addedAt: number;
};

export type SearchHit = {
  id: string;
  fileId: string;
  filename: string;
  chunkLabel: string;
  snippet: string;
  score: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ fileId: string; filename: string; chunkLabel: string }>;
  costUsd?: number;
  tokensIn?: number;
  tokensOut?: number;
};

type AppState = {
  files: LibraryFile[];
  addFiles: (files: Omit<LibraryFile, "id" | "addedAt">[]) => void;
  removeFile: (id: string) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  results: SearchHit[];
  setResults: (hits: SearchHit[]) => void;

  selectedHitId: string | null;
  selectHit: (id: string | null) => void;

  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, "id">) => void;
  clearChat: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  files: [],
  addFiles: (incoming) =>
    set((s) => ({
      files: [
        ...incoming.map((f) => ({
          id: crypto.randomUUID(),
          addedAt: Date.now(),
          ...f,
        })),
        ...s.files,
      ],
    })),
  removeFile: (id) =>
    set((s) => ({
      files: s.files.filter((f) => f.id !== id),
      results: s.results.filter((r) => r.fileId !== id),
      selectedHitId: s.selectedHitId && s.results.find((r) => r.id === s.selectedHitId)?.fileId === id
        ? null
        : s.selectedHitId,
    })),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  results: [],
  setResults: (hits) => set({ results: hits }),

  selectedHitId: null,
  selectHit: (id) => set({ selectedHitId: id }),

  messages: [],
  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, { id: crypto.randomUUID(), ...msg }],
    })),
  clearChat: () => set({ messages: [] }),
}));
