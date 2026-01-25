import { FilesPanel } from "@/components/dashboard/files-panel";
import { SearchPanel } from "@/components/dashboard/search-panel";
import { ChatPanel } from "@/components/dashboard/chat-panel";

export default function DashboardPage() {
  return (
    <div className="h-screen w-screen grid grid-cols-[280px_1fr_400px]">
      <FilesPanel />
      <SearchPanel />
      <ChatPanel />
    </div>
  );
}
