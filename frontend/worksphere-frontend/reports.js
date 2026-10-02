async function downloadEmployeeReport() {
    const btn = document.getElementById('btnEmpReport');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

    try {
        const token = localStorage.getItem('jwt_token');
        
        // We use standard fetch here because we need to parse response as a BLOB, not JSON.
        const response = await fetch('http://localhost:8080/api/reports/employees/export', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to generate report");
        }

        // Read response as binary blob
        const blob = await response.blob();
        
        // Create an invisible anchor tag to force download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Read filename from Content-Disposition header if possible, else default
        let filename = 'employees_report.csv';
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(contentDisposition);
            if (matches != null && matches[1]) { 
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showToast("Report downloaded successfully!", "success");

    } catch (error) {
        showToast(error.message, "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-download"></i> Download CSV';
    }
}

function showToast(message, type="success") {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === "error" ? "#e03131" : "#2b8a3e"; 
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
