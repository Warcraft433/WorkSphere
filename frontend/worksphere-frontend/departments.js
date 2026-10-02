document.addEventListener('DOMContentLoaded', () => {
    loadDepartments();
    
    document.getElementById('deptForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveDepartment();
    });
});

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

async function loadDepartments() {
    try {
        const response = await fetchWithAuth('/departments');
        if (!response) return;
        
        const departments = await response.json();
        const tbody = document.getElementById('deptTableBody');
        tbody.innerHTML = '';
        
        if (departments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No departments found.</td></tr>';
            return;
        }

        departments.forEach(dept => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${dept.id}</td>
                <td><strong>${dept.name}</strong></td>
                <td><i class="fa-solid fa-location-dot" style="color: var(--text-muted);"></i> ${dept.location}</td>
                <td>
                    <button class="action-btn edit-btn" onclick='openDeptModal(${JSON.stringify(dept)})' title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteDepartment(${dept.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showToast('Failed to load departments', 'error');
        console.error(error);
    }
}

function openDeptModal(dept = null) {
    document.getElementById('deptModal').style.display = 'flex';
    if (dept && dept.id) {
        document.getElementById('modalTitle').textContent = 'Edit Department';
        document.getElementById('deptId').value = dept.id;
        document.getElementById('deptName').value = dept.name;
        document.getElementById('deptLocation').value = dept.location;
    } else {
        document.getElementById('modalTitle').textContent = 'Add Department';
        document.getElementById('deptForm').reset();
        document.getElementById('deptId').value = '';
    }
}

function closeDeptModal() {
    document.getElementById('deptModal').style.display = 'none';
    document.getElementById('deptForm').reset();
}

async function saveDepartment() {
    const id = document.getElementById('deptId').value;
    const name = document.getElementById('deptName').value.trim();
    const location = document.getElementById('deptLocation').value.trim();
    
    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `/departments/${id}` : `/departments`;
    
    try {
        const res = await fetchWithAuth(endpoint, {
            method: method,
            body: JSON.stringify({ name, location })
        });
        
        if (res.ok) {
            showToast(`Department ${id ? 'updated' : 'added'} successfully!`);
            closeDeptModal();
            loadDepartments();
        } else {
            showToast('Failed to save department', 'error');
        }
    } catch (e) {
        showToast('Error saving department', 'error');
    }
}

async function deleteDepartment(id) {
    if (!confirm('Are you sure you want to delete this department? This may affect linked employees.')) return;
    
    try {
        const res = await fetchWithAuth(`/departments/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Department deleted successfully');
            loadDepartments();
        } else {
            showToast('Failed to delete department', 'error');
        }
    } catch (e) {
        showToast('Error deleting department', 'error');
    }
}
