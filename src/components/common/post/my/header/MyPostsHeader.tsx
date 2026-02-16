import { Input } from "@/components/ui/input";

function MyPostsHeader({ q, setQ }: { q: string, setQ: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">My posts</h1>
        <p className="opacity-80">Manage your publications.</p>
      </div>
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-full sm:w-80 focus-visible:ring-0 focus-visible:ring-offset-0" />
      </div>
    </div>
  );
}

export default MyPostsHeader;
