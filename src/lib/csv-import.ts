export type CsvIncomeRow = { date: string; amount: number; note?: string };
export type CsvObligationRow = {
  name: string;
  category: string;
  amount: number;
  dueDayOfMonth?: number;
  priority?: string;
};

export type CsvBankRow = {
  date: string;
  amount: number;
  description: string;
};

export type ImportPreviewRow<T> = {
  row: number;
  data: T | null;
  errors: string[];
};

export type ImportPreview<T> = {
  valid: T[];
  rows: ImportPreviewRow<T>[];
  skippedDuplicates: number;
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
  return previewIncomeCsv(text).valid;
}

export function previewIncomeCsv(text: string): ImportPreview<CsvIncomeRow> {
  const rows = parseCsv(text);
  const result: ImportPreview<CsvIncomeRow> = {
    valid: [],
    rows: [],
    skippedDuplicates: 0,
  };
  if (rows.length < 2) return result;

  const header = rows[0].map((h) => h.toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("date"));
  const amountIdx = header.findIndex(
    (h) => h.includes("amount") || h.includes("pay"),
  );
  const noteIdx = header.findIndex((h) => h.includes("note"));

  if (dateIdx < 0 || amountIdx < 0) {
    result.rows.push({
      row: 0,
      data: null,
      errors: ["Header must include date and amount columns"],
    });
    return result;
  }

  const seen = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];
    const amount = parseFloat(row[amountIdx]?.replace(/[^0-9.-]/g, "") ?? "");
    const date = row[dateIdx];

    if (!date) errors.push("Missing date");
    if (Number.isNaN(amount)) errors.push("Invalid amount");

    const data =
      errors.length === 0
        ? {
            date,
            amount,
            note: noteIdx >= 0 ? row[noteIdx] : undefined,
          }
        : null;

    if (data) {
      const key = `${data.date}-${data.amount}`;
      if (seen.has(key)) {
        result.skippedDuplicates++;
      } else {
        seen.add(key);
        result.valid.push(data);
      }
    }

    result.rows.push({ row: i + 1, data, errors });
  }

  return result;
}

export function parseObligationsCsv(text: string): CsvObligationRow[] {
  return previewObligationsCsv(text).valid;
}

export function previewObligationsCsv(
  text: string,
): ImportPreview<CsvObligationRow> {
  const rows = parseCsv(text);
  const result: ImportPreview<CsvObligationRow> = {
    valid: [],
    rows: [],
    skippedDuplicates: 0,
  };
  if (rows.length < 2) return result;

  const header = rows[0].map((h) => h.toLowerCase());
  const nameIdx = header.findIndex((h) => h === "name" || h.includes("name"));
  const catIdx = header.findIndex((h) => h.includes("category"));
  const amountIdx = header.findIndex((h) => h.includes("amount"));
  const dayIdx = header.findIndex((h) => h.includes("day") || h.includes("due"));
  const priIdx = header.findIndex((h) => h.includes("priority"));

  if (nameIdx < 0 || amountIdx < 0) {
    result.rows.push({
      row: 0,
      data: null,
      errors: ["Header must include name and amount"],
    });
    return result;
  }

  const seen = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];
    const amount = parseFloat(row[amountIdx]?.replace(/[^0-9.-]/g, "") ?? "");
    const name = row[nameIdx];

    if (!name) errors.push("Missing name");
    if (Number.isNaN(amount)) errors.push("Invalid amount");

    const data =
      errors.length === 0
        ? {
            name,
            category: catIdx >= 0 ? row[catIdx] || "other" : "other",
            amount,
            dueDayOfMonth: dayIdx >= 0 ? parseInt(row[dayIdx], 10) : undefined,
            priority: priIdx >= 0 ? row[priIdx] : "must_pay",
          }
        : null;

    if (data) {
      const key = data.name.toLowerCase();
      if (seen.has(key)) {
        result.skippedDuplicates++;
      } else {
        seen.add(key);
        result.valid.push(data);
      }
    }

    result.rows.push({ row: i + 1, data, errors });
  }

  return result;
}

/** Bank export: date, amount, description (debits negative or separate column). */
export function previewBankCsv(
  text: string,
  mapping?: { dateCol?: number; amountCol?: number; descCol?: number },
): ImportPreview<CsvBankRow> {
  const rows = parseCsv(text);
  const result: ImportPreview<CsvBankRow> = {
    valid: [],
    rows: [],
    skippedDuplicates: 0,
  };
  if (rows.length < 2) return result;

  const header = rows[0].map((h) => h.toLowerCase());
  const dateIdx =
    mapping?.dateCol ??
    header.findIndex((h) => h.includes("date") || h.includes("buchung"));
  const amountIdx =
    mapping?.amountCol ??
    header.findIndex(
      (h) =>
        h.includes("amount") ||
        h.includes("betrag") ||
        h.includes("value") ||
        h.includes("debit"),
    );
  const descIdx =
    mapping?.descCol ??
    header.findIndex(
      (h) =>
        h.includes("description") ||
        h.includes("memo") ||
        h.includes("verwendung") ||
        h.includes("payee"),
    );

  if (dateIdx < 0 || amountIdx < 0) {
    result.rows.push({
      row: 0,
      data: null,
      errors: ["Could not detect date and amount columns"],
    });
    return result;
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];
    let amount = parseFloat(row[amountIdx]?.replace(/[^0-9.-]/g, "") ?? "");
    const date = row[dateIdx];
    const description =
      descIdx >= 0 ? row[descIdx] : row.filter((_, j) => j !== dateIdx && j !== amountIdx).join(" ");

    if (!date) errors.push("Missing date");
    if (Number.isNaN(amount)) errors.push("Invalid amount");
    if (amount < 0) amount = Math.abs(amount);

    const data =
      errors.length === 0
        ? { date, amount, description: description || "Bank transaction" }
        : null;

    if (data) result.valid.push(data);
    result.rows.push({ row: i + 1, data, errors });
  }

  return result;
}
