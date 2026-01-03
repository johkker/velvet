/**
 * Utility functions for exporting data to CSV and PDF
 */

export interface ExportData {
    [key: string]: string | number | boolean | null | undefined;
}

/**
 * Convert an array of objects to CSV format
 */
export function toCSV(data: ExportData[], filename: string = 'export.csv'): void {
    if (data.length === 0) {
        console.warn('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.map(escapeCSV).join(','),
        ...data.map(row =>
            headers.map(header => escapeCSV(String(row[header] ?? ''))).join(',')
        ),
    ].join('\n');

    downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Convert an array of objects to TSV format
 */
export function toTSV(data: ExportData[], filename: string = 'export.tsv'): void {
    if (data.length === 0) {
        console.warn('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const tsvContent = [
        headers.join('\t'),
        ...data.map(row =>
            headers.map(header => String(row[header] ?? '')).join('\t')
        ),
    ].join('\n');

    downloadFile(tsvContent, filename, 'text/tab-separated-values');
}

/**
 * Convert an array of objects to JSON format
 */
export function toJSON(data: ExportData[], filename: string = 'export.json'): void {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Escape special characters in CSV values
 */
function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Trigger file download in browser
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

/**
 * Generate a timestamp suffix for filenames
 */
export function getTimestampSuffix(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `_${year}${month}${day}_${hours}${minutes}`;
}
