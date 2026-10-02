document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();

    const addForm = document.getElementById('addEmployeeForm');
    if (addForm) {
        addForm.addEventListener('submit', handleAddEmployee);
    }
});

let currentPage = 0;
let totalPages = 1;

async function loadEmployees() {
    const tbody = document.getElementById('employeeTableBody');
    try {
        const response = await fetchWithAuth(`/employees?page=${currentPage}&size=10`);
        if (!response) return; // Redirected to login
        
        const pageData = await response.json();
        const employees = pageData.content || pageData; // Fallback if backend wasn't updated yet
        
        if (pageData.content !== undefined) {
            totalPages = pageData.totalPages;
            currentPage = pageData.number;
            document.getElementById('prevPageBtn').disabled = currentPage === 0;
            document.getElementById('nextPageBtn').disabled = currentPage >= totalPages - 1 || totalPages === 0;
            document.getElementById('pageInfo').textContent = `Page ${totalPages === 0 ? 1 : currentPage + 1} of ${totalPages === 0 ? 1 : totalPages}`;
        }
        
        tbody.innerHTML = ''; // clear loading message
        
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No employees found.</td></tr>';
            return;
        }

        employees.forEach(emp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>EMP${String(emp.id).padStart(3, '0')}</td>
                <td>
                    <div class="emp-name-cell">
                        <div class="emp-avatar">${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}</div>
                        <span>${emp.firstName} ${emp.lastName}</span>
                    </div>
                </td>
                <td>${emp.email}</td>
                <td>${emp.phone || 'N/A'}</td>
                <td>${emp.hireDate || 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editEmployee(${emp.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteEmployee(${emp.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Failed to load employees:", error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load data. Please try again.</td></tr>';
        showToast("Error loading employees.", "error");
    }
}

function changePage(delta) {
    currentPage += delta;
    if (currentPage < 0) currentPage = 0;
    if (currentPage >= totalPages) currentPage = totalPages - 1;
    loadEmployees();
}

async function handleAddEmployee(e) {
    e.preventDefault();
    const btn = document.getElementById('saveEmployeeBtn');
    const errorDiv = document.getElementById('formError');
    const empId = document.getElementById('empId').value;
    const isEdit = empId !== "";
    
    // Reset state
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    errorDiv.style.display = 'none';

    const empData = {
        firstName: document.getElementById('empFirstName').value,
        lastName: document.getElementById('empLastName').value,
        email: document.getElementById('empEmail').value,
        phone: document.getElementById('empPhone').value,
        hireDate: document.getElementById('empHireDate').value,
        salary: parseFloat(document.getElementById('empSalary').value)
    };
    
    // Client-side validation
    const phoneRegex = /^[0-9]{10}$/;
    if (empData.phone && !empData.phone.match(phoneRegex)) {
        errorDiv.textContent = "Phone number must be exactly 10 digits.";
        errorDiv.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = isEdit ? 'Update Employee' : 'Save Employee';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!empData.email.match(emailRegex)) {
        errorDiv.textContent = "Please enter a valid email address.";
        errorDiv.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = isEdit ? 'Update Employee' : 'Save Employee';
        return;
    }
    
    if (isEdit) empData.id = parseInt(empId);

    try {
        const url = isEdit ? `/employees/${empId}` : '/employees';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetchWithAuth(url, {
            method: method,
            body: JSON.stringify(empData)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Failed to ${isEdit ? 'update' : 'add'} employee`);
        }

        showToast(`Employee ${isEdit ? 'updated' : 'added'} successfully!`, "success");
        closeAddEmployeeModal();
        loadEmployees(); // Refresh table
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = isEdit ? 'Update Employee' : 'Save Employee';
    }
}

async function deleteEmployee(id) {
    if(!confirm("Are you sure you want to delete this employee?")) return;
    
    try {
        const response = await fetchWithAuth(`/employees/${id}`, { method: 'DELETE' });
        if(!response.ok) throw new Error("Failed to delete employee");
        
        showToast("Employee deleted successfully", "success");
        loadEmployees();
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function editEmployee(id) {
    try {
        const response = await fetchWithAuth(`/employees/${id}`);
        if (!response.ok) throw new Error("Failed to fetch employee details");
        
        const emp = await response.json();
        
        // Pre-fill the form
        document.getElementById('empId').value = emp.id;
        document.getElementById('empFirstName').value = emp.firstName;
        document.getElementById('empLastName').value = emp.lastName;
        document.getElementById('empEmail').value = emp.email;
        document.getElementById('empPhone').value = emp.phone || '';
        document.getElementById('empHireDate').value = emp.hireDate || '';
        document.getElementById('empSalary').value = emp.salary || '';
        
        // Change UI for Edit mode
        document.getElementById('modalTitle').textContent = "Edit Employee";
        document.getElementById('saveEmployeeBtn').textContent = "Update Employee";
        
        document.getElementById('employeeModal').style.display = 'flex';
    } catch (error) {
        showToast(error.message, "error");
    }
}

/* Modal Logic */
function openAddEmployeeModal() {
    document.getElementById('addEmployeeForm').reset();
    document.getElementById('empId').value = "";
    document.getElementById('modalTitle').textContent = "Add New Employee";
    document.getElementById('saveEmployeeBtn').textContent = "Save Employee";
    document.getElementById('employeeModal').style.display = 'flex';
}

function closeAddEmployeeModal() {
    document.getElementById('employeeModal').style.display = 'none';
    document.getElementById('formError').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('employeeModal');
    if (event.target === modal) {
        closeAddEmployeeModal();
    }
}

/* Toast Logic */
function showToast(message, type="success") {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    
    if(type === "error") {
        toast.style.background = "#e03131"; // Red
    } else if(type === "info") {
        toast.style.background = "#1971c2"; // Blue
    } else {
        toast.style.background = "#2b8a3e"; // Green
    }
    
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
