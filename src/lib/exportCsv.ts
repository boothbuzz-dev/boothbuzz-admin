import * as XLSX from 'xlsx';

export type CsvCell = string | number | boolean | null | undefined;

export function escapeCsvValue(value: CsvCell): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildCsvContent(headers: string[], rows: CsvCell[][]): string {
  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
    .join('\n');
}

function toXlsxFilename(filename: string): string {
  const base = filename.replace(/\.(csv|xlsx)$/i, '');
  return `${base}.xlsx`;
}

/** Downloads data as a real Excel (.xlsx) file so it opens in Excel / Sheets. */
export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]): boolean {
  if (rows.length === 0) return false;

  const sheetData = [headers, ...rows.map((row) => row.map((cell) => cell ?? ''))];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  worksheet['!cols'] = headers.map((header, colIndex) => {
    const maxLen = sheetData.reduce((max, row) => {
      const len = String(row[colIndex] ?? '').length;
      return Math.max(max, len);
    }, header.length);
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
  XLSX.writeFile(workbook, toXlsxFilename(filename));
  return true;
}

export function csvFilename(prefix: string): string {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const safePrefix = prefix.replace(/[^a-z0-9-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  return `${safePrefix || 'export'}-${dateStamp}.xlsx`;
}
