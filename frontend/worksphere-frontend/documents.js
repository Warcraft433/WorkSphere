document.addEventListener('DOMContentLoaded', () => {
    loadDocuments();
    loadEmployeesForDocs();

    const docForm = document.getElementById('documentForm');
    if (docForm) {
        docForm.addEventListener('submit', handleUploadDocument);
    }
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
});

async function loadDocuments() {
    const tbody = document.getElementById('documentTableBody');
    try {
        const response = await fetchWithAuth('/documents');
        if (!response) return; 
        
        const docs = await response.json();
        tbody.innerHTML = '';
        
        if (docs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No documents uploaded yet.</td></tr>';
            return;
        }

        docs.forEach(doc => {
            const empName = doc.employee ? `${doc.employee.firstName} ${doc.employee.lastName}` : 'Unknown';
            const uploadedDate = doc.uploadedOn ? dateFormatter.format(new Date(doc.uploadedOn)) : 'N/A';
            
            // Just display the file name rather than the full raw path
            let fileName = doc.filePath || 'Unknown';
            if(fileName.includes('\\')) fileName = fileName.split('\\').pop();
            if(fileName.includes('/')) fileName = fileName.split('/').pop();
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>DOC${String(doc.id).padStart(3, '0')}</td>
                <td><strong>${empName}</strong></td>
                <td><span class="badge badge-warning">${doc.docType}</span></td>
                <td style="color: var(--primary-color); font-weight: 500;"><i class="fa-regular fa-file-pdf"></i> ${fileName}</td>
                <td style="color: var(--text-muted); font-size: 0.85rem;">${uploadedDate}</td>
                <td>
                    <button class="action-btn text-danger" title="Delete" onclick="deleteDocument(${doc.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Failed to load documents:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load data.</td></tr>';
    }
}

async function loadEmployeesForDocs() {
    try {
        const response = await fetchWithAuth('/employees');
        if (!response) return;
        
        const employees = await response.json();
        const select = document.getElementById('docEmployee');
        
        employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = `${emp.firstName} ${emp.lastName}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Could not load employees for dropdown");
    }
}

async function handleUploadDocument(e) {
    e.preventDefault();
    const btn = document.getElementById('saveDocBtn');
    const errorDiv = document.getElementById('formError');
    const fileInput = document.getElementById('docFile');
    
    if (fileInput.files.length === 0) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
    errorDiv.style.display = 'none';

    // 1. Build the metadata JSON
    const metaData = {
        employee: { id: parseInt(document.getElementById('docEmployee').value) },
        docType: document.getElementById('docType').value
    };

    // 2. Build the FormData (multipart/form-data)
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("meta", JSON.stringify(metaData));

    try {
        // Notice we do NOT manually set 'Content-Type' headers! 
        // Our fetchWithAuth wrapper detects FormData and deletes Content-Type so the browser sets the boundary automatically.
        const response = await fetchWithAuth('/documents/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Failed to upload document.");
        }

        showToast("File uploaded successfully!", "success");
        closeDocumentModal();
        document.getElementById('documentForm').reset();
        loadDocuments(); 
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-upload"></i> Upload';
    }
}

async function deleteDocument(id) {
    if(!confirm("Are you sure you want to delete this document record?")) return;
    
    try {
        const response = await fetchWithAuth(`/documents/${id}`, { method: 'DELETE' });
        if(!response.ok) throw new Error("Failed to delete document");
        
        showToast("Document deleted successfully", "success");
        loadDocuments();
    } catch (error) {
        showToast(error.message, "error");
    }
}

/* Modal Logic */
function openDocumentModal() {
    document.getElementById('documentModal').style.display = 'flex';
}

function closeDocumentModal() {
    document.getElementById('documentModal').style.display = 'none';
    document.getElementById('formError').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('documentModal');
    if (event.target === modal) {
        closeDocumentModal();
    }
}

/* Toast Logic */
function showToast(message, type="success") {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    
    if(type === "error") {
        toast.style.background = "#e03131"; 
    } else {
        toast.style.background = "#2b8a3e"; 
    }
    
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
