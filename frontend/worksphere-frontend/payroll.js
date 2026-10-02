let employeeDataStore = {}; // Map of ID to Salary

document.addEventListener('DOMContentLoaded', () => {
    loadPayroll();
    loadEmployeesForPayroll();

    const payrollForm = document.getElementById('payrollForm');
    if (payrollForm) {
        payrollForm.addEventListener('submit', handleRunPayroll);
    }
    
    // Auto-fill current month
    const today = new Date();
    const monthYear = today.toLocaleString('default', { month: 'short' }) + " " + today.getFullYear();
    document.getElementById('payrollMonth').value = monthYear;
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
});

async function loadPayroll() {
    const tbody = document.getElementById('payrollTableBody');
    try {
        const response = await fetchWithAuth('/payrolls');
        if (!response) return; 
        
        const payrolls = await response.json();
        tbody.innerHTML = '';
        
        if (payrolls.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">
                <i class="fa-solid fa-money-check-dollar" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.4"></i>
                No payroll records found. Click <strong>Run Payroll</strong> to generate the first one.
            </td></tr>`;
            updateSummaryCards([], 0);
            return;
        }

        // Compute totals for summary cards
        const totalNet = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
        const totalBasic = payrolls.reduce((sum, p) => sum + (p.basicSalary || 0), 0);
        const totalDeductions = payrolls.reduce((sum, p) => sum + (p.deductions || 0), 0);
        updateSummaryCards(payrolls, totalNet, totalBasic, totalDeductions);

        payrolls.forEach(record => {
            const empName = record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'Unknown';
            const generatedDate = record.createdOn ? dateFormatter.format(new Date(record.createdOn)) : 'N/A';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>PR${String(record.id).padStart(4, '0')}</td>
                <td><strong>${empName}</strong></td>
                <td>${record.month || '-'}</td>
                <td>${currencyFormatter.format(record.basicSalary || 0)}</td>
                <td class="text-success">+ ${currencyFormatter.format(record.allowances || 0)}</td>
                <td class="text-danger">- ${currencyFormatter.format(record.deductions || 0)}</td>
                <td><strong>${currencyFormatter.format(record.netSalary || 0)}</strong></td>
                <td style="color: var(--text-muted); font-size: 0.8rem;">${generatedDate}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Failed to load payroll:", error);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Failed to load data.</td></tr>';
    }
}

function updateSummaryCards(payrolls, totalNet = 0, totalBasic = 0, totalDeductions = 0) {
    const container = document.getElementById('payrollSummaryCards');
    if (!container) return;
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-info">
                <h3><i class="fa-solid fa-file-invoice-dollar" style="color:var(--primary-color);margin-right:6px"></i>Total Records</h3>
                <div class="stat-value">${payrolls.length}</div>
                <span class="stat-subtext">Payroll entries</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h3><i class="fa-solid fa-money-bill-wave" style="color:var(--success);margin-right:6px"></i>Total Net Pay</h3>
                <div class="stat-value" style="font-size:1.5rem">${currencyFormatter.format(totalNet)}</div>
                <span class="stat-subtext">All employees combined</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-info">
                <h3><i class="fa-solid fa-circle-minus" style="color:var(--danger);margin-right:6px"></i>Total Deductions</h3>
                <div class="stat-value" style="font-size:1.5rem;color:var(--danger)">${currencyFormatter.format(totalDeductions)}</div>
                <span class="stat-subtext">Tax + custom deductions</span>
            </div>
        </div>
    `;
}

async function loadEmployeesForPayroll() {

    try {
        const response = await fetchWithAuth('/employees');
        if (!response) return;
        
        const data = await response.json();
        const employees = Array.isArray(data) ? data : (data.content || []);
        const select = document.getElementById('payrollEmployee');
        
        employees.forEach(emp => {
            employeeDataStore[emp.id] = emp.salary || 0; // store salary
            
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = `${emp.firstName} ${emp.lastName}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Could not load employees for dropdown");
    }
}

// Auto-fill the basic salary when an employee is selected
function handleEmployeeSelection() {
    const empId = document.getElementById('payrollEmployee').value;
    const basicInput = document.getElementById('payrollBasic');
    
    if (empId && employeeDataStore[empId] !== undefined) {
        basicInput.value = employeeDataStore[empId];
    } else {
        basicInput.value = '';
    }
}

async function handleRunPayroll(e) {
    e.preventDefault();
    const btn = document.getElementById('savePayrollBtn');
    const errorDiv = document.getElementById('formError');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    errorDiv.style.display = 'none';

    const empId = document.getElementById('payrollEmployee').value;
    if (!empId) {
        errorDiv.textContent = "Please select an employee.";
        errorDiv.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = 'Generate & Save';
        return;
    }

    const newPayroll = {
        employee: { id: parseInt(empId) },
        month: document.getElementById('payrollMonth').value,
        basicSalary: parseFloat(document.getElementById('payrollBasic').value) || 0,
        allowances: parseFloat(document.getElementById('payrollAllowances').value) || 0,
        deductions: parseFloat(document.getElementById('payrollDeductions').value) || 0
    };

    try {
        const response = await fetchWithAuth('/payrolls', {
            method: 'POST',
            body: JSON.stringify(newPayroll)
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            let errMsg = "Failed to generate payroll.";
            if (data && data.message) errMsg = data.message;
            throw new Error(errMsg);
        }

        showToast("Payroll successfully generated & saved!", "success");
        closePayrollModal();
        
        // Reset custom fields but keep month
        document.getElementById('payrollEmployee').value = '';
        document.getElementById('payrollBasic').value = '';
        document.getElementById('payrollAllowances').value = '0.00';
        document.getElementById('payrollDeductions').value = '0.00';
        
        loadPayroll(); // Refresh table
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Generate & Save';
    }
}

/* Modal Logic */
function openPayrollModal() {
    document.getElementById('payrollModal').style.display = 'flex';
}

function closePayrollModal() {
    document.getElementById('payrollModal').style.display = 'none';
    document.getElementById('formError').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('payrollModal');
    if (event.target === modal) {
        closePayrollModal();
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
