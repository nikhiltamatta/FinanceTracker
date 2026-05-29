import { ImportClient } from "@/components/ImportClient";
import { requireUser } from "@/lib/page-auth";

export default async function ImportPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Import CSV</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Bulk-add income or obligations. First row must be headers.
        </p>
      </header>
      <ImportClient />
    </div>
  );
}
