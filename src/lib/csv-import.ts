export type CsvIncomeRow = { date: string; amount: number; note?: string };
export type CsvObligationRow = {
  name: string;
  category: string;
  amount: number;
  dueDayOfMonth?: number;
  priority?: string;
};

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      current.push(field.trim());
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      current.push(field.trim());
      if (current.some((cell) => cell.length > 0)) rows.push(current);
      current = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || current.length > 0) {
    current.push(field.trim());
    if (current.some((cell) => cell.length > 0)) rows.push(current);
  }
  return rows;
}

export function parseIncomeCsv(text: string): CsvIncomeRow[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("date"));
  const amountIdx = header.findIndex(
    (h) => h.includes("amount") || h.includes("pay"),
  );
  const noteIdx = header.findIndex((h) => h.includes("note"));

  if (dateIdx < 0 || amountIdx < 0) return [];

  const result: CsvIncomeRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const amount = parseFloat(row[amountIdx]?.replace(/[^0-9.-]/g, "") ?? "");
    if (!row[dateIdx] || Number.isNaN(amount)) continue;
    result.push({
      date: row[dateIdx],
      amount,
      note: noteIdx >= 0 ? row[noteIdx] : undefined,
    });
  }
  return result;
}

export function parseObligationsCsv(text: string): CsvObligationRow[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.toLowerCase());
  const nameIdx = header.findIndex((h) => h === "name" || h.includes("name"));
  const catIdx = header.findIndex((h) => h.includes("category"));
  const amountIdx = header.findIndex((h) => h.includes("amount"));
  const dayIdx = header.findIndex((h) => h.includes("day") || h.includes("due"));
  const priIdx = header.findIndex((h) => h.includes("priority"));

  if (nameIdx < 0 || amountIdx < 0) return [];

  const result: CsvObligationRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const amount = parseFloat(row[amountIdx]?.replace(/[^0-9.-]/g, "") ?? "");
    if (!row[nameIdx] || Number.isNaN(amount)) continue;
    result.push({
      name: row[nameIdx],
      category: catIdx >= 0 ? row[catIdx] || "other" : "other",
      amount,
      dueDayOfMonth: dayIdx >= 0 ? parseInt(row[dayIdx], 10) : undefined,
      priority: priIdx >= 0 ? row[priIdx] : "must_pay",
    });
  }
  return result;
}
