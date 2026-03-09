import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun, VerticalAlign, BorderStyle, TableLayoutType } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Excel Export with Flattened Participant Data
 */
export const downloadExcel = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
        alert("No data available to download");
        return;
    }

    const flatData = data.flatMap((reg: any) => {
        const members = reg.membersDetails || [];
        return members.map((m: any) => ({
            "TEAM": reg.teamName || "Solo",
            "NAME": m.name || "Unknown",
            "USN": m.usn || "N/A",
            "COLLEGE": m.college || reg.college || "N/A",
            "MOBILE NO.": m.phone || reg.phone || "N/A",
            "PAYMENT STATUS": reg.paymentStatus || "N/A",
            "EVENT": reg.event || "N/A",
            "REGISTERED AT": reg.registeredAt || "N/A"
        }));
    });

    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    // Auto-size columns for professional look
    worksheet["!cols"] = [
        { wch: 20 }, // TEAM
        { wch: 25 }, // NAME
        { wch: 15 }, // USN
        { wch: 35 }, // COLLEGE
        { wch: 20 }, // MOBILE NO
        { wch: 15 }, // STATUS
        { wch: 20 }, // EVENT
        { wch: 25 }  // REGISTERED AT
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Word Export with Rigid DXA Layout for Mobile Compatibility
 */
export const downloadWord = async (data: any[], fileName: string, eventInfo?: { title: string, date: string, time?: string }) => {
    if (!data || data.length === 0) {
        alert("No data available to download");
        return;
    }

    // Strict absolute widths in DXA (1/1440 inch). Total ~9300
    const COL_WIDTHS = [1200, 2400, 1400, 2000, 1500, 800];

    const tableHeader = (text: string, index: number) => new TableCell({
        children: [new Paragraph({
            children: [new TextRun({ text, bold: true, size: 18 })],
            alignment: AlignmentType.CENTER
        })],
        shading: { fill: "f3f4f6" },
        verticalAlign: VerticalAlign.CENTER,
        width: { size: COL_WIDTHS[index], type: WidthType.DXA },
    });

    const tableRows: TableRow[] = [];

    // Header Row
    tableRows.push(new TableRow({
        children: [
            tableHeader("TEAM", 0),
            tableHeader("NAME", 1),
            tableHeader("USN", 2),
            tableHeader("COLLEGE", 3),
            tableHeader("MOBILE", 4),
            tableHeader("SIGN", 5),
        ]
    }));

    // Data Rows
    data.forEach((reg: any) => {
        const members = reg.membersDetails || [];
        const rowSpan = Math.max(1, members.length);

        members.forEach((member: any, index: number) => {
            const cells = [];

            // Team Name
            if (index === 0) {
                cells.push(new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: reg.teamName, bold: true, size: 14 })],
                        alignment: AlignmentType.CENTER
                    })],
                    rowSpan: rowSpan,
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: COL_WIDTHS[0], type: WidthType.DXA },
                }));
            }

            // Member Name
            cells.push(new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: member.name, size: 14 })]
                })],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: COL_WIDTHS[1], type: WidthType.DXA },
                margins: { left: 50, right: 50 }
            }));

            // USN
            cells.push(new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: member.usn, size: 14 })],
                    alignment: AlignmentType.CENTER
                })],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: COL_WIDTHS[2], type: WidthType.DXA },
            }));

            // College
            if (index === 0) {
                cells.push(new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: reg.college, size: 12 })],
                        alignment: AlignmentType.CENTER
                    })],
                    rowSpan: rowSpan,
                    verticalAlign: VerticalAlign.CENTER,
                    width: { size: COL_WIDTHS[3], type: WidthType.DXA },
                }));
            }

            // Phone
            cells.push(new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: member.phone, size: 14 })],
                    alignment: AlignmentType.CENTER
                })],
                verticalAlign: VerticalAlign.CENTER,
                width: { size: COL_WIDTHS[4], type: WidthType.DXA },
            }));

            // Signature
            cells.push(new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "___", size: 8 })], alignment: AlignmentType.CENTER })],
                verticalAlign: VerticalAlign.BOTTOM,
                width: { size: COL_WIDTHS[5], type: WidthType.DXA },
            }));

            tableRows.push(new TableRow({ children: cells }));
        });
    });

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 720, right: 360, bottom: 720, left: 360 }, // Narrower sideways margins
                }
            },
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: "VARNOTHSAVA - 2026", bold: true, size: 36 }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: `${eventInfo?.date || '11-MARCH-2026'}, 9:00 AM TO 3:00 PM`, bold: true, size: 20 }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 300 },
                    children: [
                        new TextRun({ text: (eventInfo?.title || "EVENT ROSTER").toUpperCase(), bold: true, size: 24, underline: {} }),
                    ],
                }),
                new Table({
                    width: { size: 9300, type: WidthType.DXA },
                    layout: TableLayoutType.FIXED,
                    alignment: AlignmentType.CENTER,
                    columnWidths: COL_WIDTHS,
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                    },
                    rows: tableRows,
                }),
                new Paragraph({
                    spacing: { before: 300 },
                    children: [
                        new TextRun({ text: "* Technical/Cultural Event Official Roster - Varnothsava 2026", size: 14, italics: true })
                    ]
                })
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.docx`);
};

export const fetchAndDownload = async (
    type: string,
    fileName: string,
    getAuthToken: () => Promise<string | null>,
    params: Record<string, string | undefined> = {},
    format: 'excel' | 'word' = 'excel',
    eventInfo?: { title: string, date: string, time?: string }
) => {
    try {
        const token = await getAuthToken();
        if (!token) throw new Error("Please login again to continue");

        const queryParams = new URLSearchParams({ type });
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        const res = await fetch(`/api/admin/export?${queryParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Failed to fetch data for export");
        }

        const { data } = await res.json();

        if (format === 'word') {
            await downloadWord(data, fileName, eventInfo);
        } else {
            downloadExcel(data, fileName);
        }
    } catch (error: any) {
        console.error("Export Error:", error);
        alert(error.message || "An error occurred during export");
    }
};
