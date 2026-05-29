"use client";

export function ExportBackupButton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-medium">Backup data</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Download all obligations, income, payments, and goals as JSON.
      </p>
      <a
        href="/api/export"
        className="mt-3 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Download backup
      </a>
    </div>
  );
}
