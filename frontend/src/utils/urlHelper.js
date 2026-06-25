/**
 * Strip internal Docker/backend hostname from file URLs.
 * Backend may return URLs like http://backend:8000/media/file.pdf
 * which are inaccessible from the browser. This extracts just the pathname.
 * Azure Blob Storage URLs (*.blob.core.windows.net) are external and kept as-is.
 */
export function sanitizeFileUrl(fileUrl) {
    if (!fileUrl) return '#';
    // Azure Blob Storage URLs are external and should be used as-is
    if (fileUrl.includes('blob.core.windows.net')) return fileUrl;
    // If it contains a protocol and an internal hostname, strip to just the path
    if (fileUrl.includes('://')) {
        try {
            const url = new URL(fileUrl);
            return url.pathname;
        } catch (e) {
            // Fall through to return as-is
        }
    }
    // Ensure it starts with /
    if (!fileUrl.startsWith('/')) return '/' + fileUrl;
    return fileUrl;
}
