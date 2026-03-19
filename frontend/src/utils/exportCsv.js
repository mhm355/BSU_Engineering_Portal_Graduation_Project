/**
 * Export array data as a downloadable CSV file.
 * @param {Array<Object>} data - Array of row objects.
 * @param {Array<{key: string, label: string}>} columns - Column definitions.
 * @param {string} filename - Name for the downloaded file (without extension).
 */
export function exportToCsv(data, columns, filename = 'export') {
    if (!data || data.length === 0) return;

    const BOM = '\uFEFF'; // UTF-8 BOM for Arabic support in Excel
    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row =>
        columns.map(c => {
            const val = row[c.key] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
    );

    const csvContent = BOM + [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
