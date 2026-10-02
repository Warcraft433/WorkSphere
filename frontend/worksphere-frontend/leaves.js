document.addEventListener('DOMContentLoaded', () => {
    loadLeaves();
    loadEmployeesForDropdown();

    const leaveForm = document.getElementById('leaveForm');
    if (leaveForm) {
        leaveForm.addEventListener('submit', handleApplyLeave);
    }
});

async function loadLeaves() {
    const tbody = document.getElementById('leaveTableBody');
    try {
        const response = await fetchWithAuth('/leaverequests');
        if (!response) return; 
        
        const leaves = await response.json();
        tbody.innerHTML = '';
        
        if (leaves.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No leave requests found.</td></tr>';
            return;
        }

        leaves.forEach(leave => {
            const empName = leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'Unknown';
            const statusClass = getStatusClass(leave.status);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>LR${String(leave.id).padStart(3, '0')}</td>
                <td><strong>${empName}</strong></td>
                <td>${leave.leaveType}</td>
                <td>${leave.startDate}</td>
                <td>${leave.endDate}</td>
                <td>${leave.reason || '-'}</td>
                <td><span class="badge ${statusClass}">${leave.status}</span></td>
                <td>
                    <button class="action-btn text-success" title="Approve" onclick="updateStatus(${leave.id}, 'APPROVED')"><i class="fa-solid fa-check"></i></button>
                    <button class="action-btn text-danger" title="Reject" onclick="updateStatus(${leave.id}, 'REJECTED')"><i class="fa-solid fa-xmark"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Failed to load leaves:", error);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Failed to load data.</td></tr>';
    }
}

async function loadEmployeesForDropdown() {
    try {
        const response = await fetchWithAuth('/employees');
        if (!response) return;
        
        const data = await response.json();
        const employees = Array.isArray(data) ? data : (data.content || []);
        const select = document.getElementById('leaveEmployee');
        
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

async function handleApplyLeave(e) {
    e.preventDefault();
    const btn = document.getElementById('saveLeaveBtn');
    const errorDiv = document.getElementById('formError');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    errorDiv.style.display = 'none';

    const newLeave = {
        employee: { id: parseInt(document.getElementById('leaveEmployee').value) },
        leaveType: document.getElementById('leaveType').value,
        startDate: document.getElementById('leaveStart').value,
        endDate: document.getElementById('leaveEnd').value,
        reason: document.getElementById('leaveReason').value
    };

    try {
        const response = await fetchWithAuth('/leaverequests', {
            method: 'POST',
            body: JSON.stringify(newLeave)
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            let errMsg = "Failed to submit leave request.";
            if (data && data.message) errMsg = data.message;
            else if (data && data.error) errMsg = data.error;
            else {
                // Read text if not json
                const text = await response.text().catch(()=>"");
                if (text) errMsg = text;
            }
            throw new Error(errMsg);
        }

        showToast("Leave requested successfully!", "success");
        closeLeaveModal();
        document.getElementById('leaveForm').reset();
        loadLeaves();
    } catch (error) {
        // Here we handle the Date Overlap IllegalArgumentException from backend!
        let msg = error.message;
        // Sometimes backend throws 500 with stack trace string in message, we can sanitize it
        if(msg.includes("IllegalArgumentException")) {
            msg = msg.split("IllegalArgumentException:")[1].split('"')[0].trim();
        } else if (msg.includes("overlap")) {
            msg = "Leave dates overlap with an already approved leave.";
        }
        
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Submit Request';
    }
}

async function updateStatus(id, newStatus) {
    if(!confirm(`Are you sure you want to mark this leave as ${newStatus}?`)) return;
    
    try {
        // First get the leave request
        const getRes = await fetchWithAuth(`/leaverequests/${id}`);
        if (!getRes.ok) throw new Error("Failed to fetch leave details");
        const leave = await getRes.json();
        
        leave.status = newStatus;
        
        // Then PUT it
        const putRes = await fetchWithAuth(`/leaverequests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(leave)
        });
        
        if (!putRes.ok) throw new Error("Failed to update status");
        
        showToast(`Leave marked as ${newStatus}`, "success");
        loadLeaves();
    } catch(err) {
        showToast(err.message, "error");
    }
}

function getStatusClass(status) {
    if (status === 'APPROVED') return 'badge-success';
    if (status === 'REJECTED') return 'badge-danger';
    return 'badge-warning'; // PENDING
}

/* Modal Logic */
function openLeaveModal() {
    document.getElementById('leaveModal').style.display = 'flex';
}

function closeLeaveModal() {
    document.getElementById('leaveModal').style.display = 'none';
    document.getElementById('formError').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('leaveModal');
    if (event.target === modal) {
        closeLeaveModal();
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
