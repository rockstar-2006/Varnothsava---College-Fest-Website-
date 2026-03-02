import * as XLSX from 'xlsx';

export const downloadExcel = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
        alert("No data available to download");
        return;
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const fetchAndDownload = async (
    type: string,
    fileName: string,
    getAuthToken: () => Promise<string | null>,
    params: Record<string, string | undefined> = {}
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
        downloadExcel(data, fileName);
    } catch (error: any) {
        console.error("Export Error:", error);
        alert(error.message || "An error occurred during export");
    }
};
