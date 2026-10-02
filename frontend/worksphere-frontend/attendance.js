let currentActiveAttendanceId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
    loadAttendance();
});

async function loadEmployees() {
    try {
        const response = await fetchWithAuth('/employees');
        if (!response) return;
        const employees = await response.json();
        const select = document.getElementById('attEmployeeSelect');
        employees.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.id;
            opt.textContent = `${emp.firstName} ${emp.lastName}`;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error("Failed to load employees");
    }
}

async function loadAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    try {
        const response = await fetchWithAuth('/attendances');
        if (!response) return;
        
        const records = await response.json();
        tbody.innerHTML = '';
        
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No attendance records found.</td></tr>';
            return;
        }

        // Store latest active attendance for Clock Out
        currentActiveAttendanceId = null;

        records.forEach(att => {
            if (att.checkOut === null) {
                currentActiveAttendanceId = att.id;
            }

            const empName = att.employee ? `${att.employee.firstName} ${att.employee.lastName}` : 'Unknown';
            let statusClass = 'badge-success';
            if(att.status === 'HALF_DAY') statusClass = 'badge-warning';
            if(att.status === 'ABSENT') statusClass = 'badge-danger';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${att.workDate}</strong></td>
                <td>${empName}</td>
                <td>${att.checkIn || '-'}</td>
                <td>${att.checkOut || '<span style="color:var(--text-muted); font-style:italic;">Active Shift</span>'}</td>
                <td><span class="badge ${statusClass}">${att.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Failed to load data.</td></tr>';
    }
}

async function clockIn() {
    const empId = document.getElementById('attEmployeeSelect').value;
    const errorDiv = document.getElementById('attError');
    errorDiv.style.display = 'none';

    try {
        const response = await fetchWithAuth(`/attendances/clock-in/${empId}`, { method: 'POST' });
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Clock-in failed");
        }
        
        showToast("Successfully clocked in!", "success");
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
        errorDiv.textContent = "You don't have an active shift to clock out of!";
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetchWithAuth(`/attendances/clock-out/${currentActiveAttendanceId}`, { method: 'POST' });
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Clock-out failed");
        }
        
        showToast("Successfully clocked out!", "success");
        loadAttendance();
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
    }
}

function showToast(message, type="success") {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === "error" ? "#e03131" : "#2b8a3e"; 
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}
