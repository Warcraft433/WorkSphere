let currentActiveAttendanceId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
    loadAttendance();
});

async function loadEmployees() {
    try {
        const response = await fetchWithAuth('/employees');
        if (!response) return;
        const data = await response.json();
        const employees = Array.isArray(data) ? data : (data.content || []);
        const select = document.getElementById('attEmployeeSelect');
        employees.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.id;
            opt.textContent = `${emp.firstName} ${emp.lastName}`;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error('Failed to load employees');
    }
}

async function loadAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';

    try {
        const response = await fetchWithAuth('/attendances');
        if (!response) return;

        const records = await response.json();
        tbody.innerHTML = '';
        currentActiveAttendanceId = null;

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted)">No attendance records found.</td></tr>';
            return;
        }

        // Sort descending by work date
        records.sort((a, b) => new Date(b.workDate) - new Date(a.workDate));

        records.forEach(att => {
            if (att.checkOut === null) {
                currentActiveAttendanceId = att.id;
            }

            const empName = att.employee
                ? `${att.employee.firstName} ${att.employee.lastName}`
                : 'Unknown';

            let statusClass = 'badge-success';
            if (att.status === 'HALF_DAY') statusClass = 'badge-warning';
            if (att.status === 'ABSENT')   statusClass = 'badge-danger';

            const activeShift = `<span style="color:var(--success);font-style:italic;font-size:0.8rem"><i class="fa-solid fa-circle-dot fa-beat" style="margin-right:4px"></i>Active</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${att.workDate}</strong></td>
                <td>${empName}</td>
                <td>${att.checkIn || '–'}</td>
                <td>${att.checkOut || activeShift}</td>
                <td><span class="badge ${statusClass}">${att.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--danger)">Failed to load data.</td></tr>';
    }
}

async function clockIn() {
    const empId = document.getElementById('attEmployeeSelect').value;
    const errorDiv = document.getElementById('attError');
    errorDiv.style.display = 'none';

    if (!empId) {
        errorDiv.textContent = 'Please select an employee.';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetchWithAuth(`/attendances/clock-in/${empId}`, { method: 'POST' });
        if (!response) return;

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Clock-in failed');
        }

        showToast('Successfully clocked in!', 'success');
        loadAttendance();
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    }
}

async function clockOut() {
    const errorDiv = document.getElementById('attError');
    errorDiv.style.display = 'none';

    if (!currentActiveAttendanceId) {
        errorDiv.textContent = "No active shift found. Please clock in first.";
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetchWithAuth(`/attendances/clock-out/${currentActiveAttendanceId}`, { method: 'POST' });
        if (!response) return;

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Clock-out failed');
        }

        showToast('Successfully clocked out!', 'success');
        currentActiveAttendanceId = null;
        loadAttendance();
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = type === 'error' ? 'var(--danger)' : 'var(--success)';
    toast.className = 'toast show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}
