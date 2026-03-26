/**
 * Strip internal Docker/backend hostname from file URLs.
 * Backend may return URLs like http://backend:8000/media/file.pdf
 * which are inaccessible from the browser. This extracts just the pathname.
 */
export function sanitizeFileUrl(fileUrl) {
    if (!fileUrl) return '#';
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
