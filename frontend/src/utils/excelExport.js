/**
 * Excel Export Utility
 * Provides functions to export data to Excel files
 */
import * as XLSX from 'xlsx';

/**
 * Export data to an Excel file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions { key: 'fieldName', header: 'Display Name' }
 * @param {string} filename - Name of the file (without extension)
 * @param {string} sheetName - Name of the worksheet (default: 'Sheet1')
 */
export const exportToExcel = (data, columns, filename, sheetName = 'Sheet1') => {
    try {
        // Transform data to match column headers
        const exportData = data.map(row => {
            const newRow = {};
            columns.forEach(col => {
                newRow[col.header] = row[col.key] ?? '';
            });
            return newRow;
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Set column widths based on header length
        const colWidths = columns.map(col => ({
            wch: Math.max(col.header.length + 2, 15)
        }));
        worksheet['!cols'] = colWidths;

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate filename with date
        const date = new Date().toISOString().split('T')[0];
        const fullFilename = `${filename}_${date}.xlsx`;

        // Download file
        XLSX.writeFile(workbook, fullFilename);

        return true;
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        return false;
    }
};

/**
 * Export grades data specifically
 * @param {Array} students - Array of student objects with grades (from API)
 * @param {Array} subjects - Array of subjects
 * @param {string} filename - Filename prefix
 */
export const exportGradesToExcel = (students, subjects, filename) => {
    // Build headers: Name, National ID, then for each subject: coursework, midterm, final
    const headers = ['الاسم', 'الرقم القومي'];
    subjects.forEach(subj => {
        headers.push(`${subj.name} - أعمال`);
        headers.push(`${subj.name} - ميدترم`);
        headers.push(`${subj.name} - نهائي`);
    });

    const data = students.map(student => {
        const row = {
            'الاسم': student.full_name,
            'الرقم القومي': student.national_id,
        };

        // Add grade for each subject
        subjects.forEach(subj => {
            const studentSubject = student.subjects?.find(s => s.subject_id === subj.id) || {};
            row[`${subj.name} - أعمال`] = studentSubject.coursework ?? '-';
            row[`${subj.name} - ميدترم`] = studentSubject.midterm ?? '-';
            row[`${subj.name} - نهائي`] = studentSubject.final ?? '-';
        });

        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });

    // Set column widths
    const colWidths = headers.map(h => ({ wch: Math.max(h.length + 2, 12) }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الدرجات');

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
};

/**
 * Export attendance data
 * @param {Array} students - Array of student attendance records
 * @param {string} courseName - Name of the course
 * @param {string} date - Attendance date
 */
export const exportAttendanceToExcel = (students, courseName, date) => {
    const columns = [
        { key: 'full_name', header: 'الاسم' },
        { key: 'national_id', header: 'الرقم القومي' },
        { key: 'status', header: 'الحالة' },
    ];

    const data = students.map(s => ({
        full_name: s.full_name || s.student_name,
        national_id: s.national_id || s.student_national_id,
        status: s.status === 'PRESENT' ? 'حاضر' : s.status === 'ABSENT' ? 'غائب' : s.status === 'LATE' ? 'متأخر' : s.status,
    }));

    exportToExcel(data, columns, `حضور_${courseName}_${date}`, 'الحضور');
};

/**
 * Export simple table data
 * @param {Array} data - Table data
 * @param {Array} columns - Column definitions
 * @param {string} filename - Filename
 */
export const exportTableToExcel = (data, columns, filename) => {
    exportToExcel(data, columns, filename);
};
