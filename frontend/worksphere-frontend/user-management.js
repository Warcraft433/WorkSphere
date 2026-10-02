const ALL_MODULES = ['Dashboard', 'Employees', 'Departments', 'Attendance', 'Leaves', 'Payroll', 'Reports', 'Documents'];

document.addEventListener('DOMContentLoaded', () => {
    // Guard: Admin-only page
    const role = getCurrentRole();
    if (role !== 'ADMIN') {
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('accessDenied').style.display = 'block';
        return;
    }

    loadSubAdmins();
    loadEmployeesForAccess();

    document.getElementById('subAdminForm').addEventListener('submit', handleCreateSubAdmin);
});

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-sub-admins').style.display = 'none';
    document.getElementById('tab-employees').style.display = 'none';

    document.getElementById(`tab-${tab}`).style.display = 'block';
    event.target.classList.add('active');
}

// ---- SUB-ADMINS ----
async function loadSubAdmins() {
    const container = document.getElementById('subAdminList');
    try {
        const res = await fetchWithAuth('/users');
        if (!res) return;
        const users = await res.json();
        const subAdmins = users.filter(u => u.role === 'SUB_ADMIN');

        if (subAdmins.length === 0) {
            container.innerHTML = `<div class="user-access-card">
                <p style="color:var(--text-muted)">No sub-admin accounts yet. Create one above.</p>
            </div>`;
            return;
        }

        container.innerHTML = subAdmins.map(u => `
            <div class="user-access-card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
                    <div>
                        <h4><i class="fa-solid fa-user-shield" style="color:var(--primary-color);margin-right:6px"></i>${escHtml(u.username)}</h4>
                        <span class="badge badge-primary" style="margin-top:4px">SUB_ADMIN</span>
                        <span class="badge ${u.status ? 'badge-success' : 'badge-danger'}" style="margin-left:6px">${u.status ? 'Active' : 'Disabled'}</span>
                    </div>
                    <div style="display:flex;gap:8px">
                        <button class="btn-secondary" onclick="openModulesModal(${u.id}, '${escHtml(u.username)}', '${escHtml(u.allowedModules)}')" style="padding:7px 12px;font-size:0.82rem">
                            <i class="fa-solid fa-shield-halved"></i> Permissions
                        </button>
                        <button class="btn-secondary" onclick="toggleUserStatus(${u.id}, ${u.status})" style="padding:7px 12px;font-size:0.82rem;color:${u.status ? 'var(--danger)' : 'var(--success)'}">
                            <i class="fa-solid fa-${u.status ? 'ban' : 'check'}"></i> ${u.status ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>
                <div style="margin-top:10px">
                    <small style="color:var(--text-muted)">Modules: </small>
                    ${(u.allowedModules || 'None').split(',').map(m => m.trim()).filter(Boolean).map(m => 
                        `<span class="badge badge-primary" style="margin:2px 3px">${m}</span>`
                    ).join('') || '<span style="color:var(--text-muted);font-size:0.8rem">No modules assigned</span>'}
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<p style="color:var(--danger)">Failed to load sub-admins: ${e.message}</p>`;
    }
}

async function handleCreateSubAdmin(e) {
    e.preventDefault();
    const btn = document.getElementById('createSaBtn');
    const err = document.getElementById('subAdminError');
    btn.disabled = true;
    err.style.display = 'none';

    const payload = {
        username: document.getElementById('saUsername').value.trim(),
        password: document.getElementById('saPassword').value,
        allowedModules: document.getElementById('saModules').value.trim()
    };

    try {
        const res = await fetchWithAuth('/users/sub-admin', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg);
        }
        showToast('Sub-admin account created!', 'success');
        closeSubAdminModal();
        loadSubAdmins();
    } catch (ex) {
        err.textContent = ex.message;
        err.style.display = 'block';
    } finally {
        btn.disabled = false;
    }
}

function openSubAdminModal() {
    document.getElementById('subAdminModal').style.display = 'flex';
    document.getElementById('subAdminError').style.display = 'none';
    document.getElementById('subAdminForm').reset();
}

function closeSubAdminModal() {
    document.getElementById('subAdminModal').style.display = 'none';
}

// ---- MODULE PERMISSIONS ----
function openModulesModal(userId, username, currentModules) {
    document.getElementById('editUserId').value = userId;
    document.getElementById('editingUsername').textContent = `Editing: ${username}`;

    const selected = (currentModules || '').split(',').map(m => m.trim()).filter(Boolean);
    const container = document.getElementById('moduleCheckboxes');
    container.innerHTML = ALL_MODULES.map(mod => `
        <label class="module-checkbox-item">
            <input type="checkbox" value="${mod}" ${selected.includes(mod) ? 'checked' : ''}>
            ${mod}
        </label>
    `).join('');

    document.getElementById('modulesModal').style.display = 'flex';
}

function closeModulesModal() {
    document.getElementById('modulesModal').style.display = 'none';
}

async function saveModules() {
    const userId = document.getElementById('editUserId').value;
    const checked = [...document.querySelectorAll('#moduleCheckboxes input:checked')].map(c => c.value);
    const allowedModules = checked.join(',');

    try {
        const res = await fetchWithAuth(`/users/${userId}/modules`, {
            method: 'PATCH',
            body: JSON.stringify({ allowedModules })
        });
        if (!res.ok) throw new Error('Failed to save');
        showToast('Permissions saved!', 'success');
        closeModulesModal();
        loadSubAdmins();
    } catch (e) {
        showToast('Error saving permissions: ' + e.message, 'error');
    }
}

// ---- EMPLOYEE ACCOUNTS ----
async function loadEmployeesForAccess() {
    const container = document.getElementById('employeeAccountList');
    try {
        const [empRes, userRes] = await Promise.all([
            fetchWithAuth('/employees?page=0&size=100'),
            fetchWithAuth('/users')
        ]);
        if (!empRes || !userRes) return;

        const empData = await empRes.json();
        const employees = Array.isArray(empData) ? empData : (empData.content || []);
        const users = await userRes.json();

        // Map employee IDs that already have accounts
        const enabledEmpIds = new Set(users
            .filter(u => u.employeeId != null)
            .map(u => u.employeeId));

        if (employees.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted)">No employees found.</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead><tr>
                        <th>Employee</th>
                        <th>Email</th>
                        <th>Hire Date</th>
                        <th>Login Status</th>
                        <th>Action</th>
                    </tr></thead>
                    <tbody>
                        ${employees.map(emp => {
                            const hasAccount = enabledEmpIds.has(emp.id);
                            return `<tr>
                                <td><div class="emp-name-cell">
                                    <div class="emp-avatar">${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}</div>
                                    ${emp.firstName} ${emp.lastName}
                                </div></td>
                                <td>${emp.email}</td>
                                <td>${emp.hireDate || '–'}</td>
                                <td><span class="badge ${hasAccount ? 'badge-success' : 'badge-warning'}">${hasAccount ? 'Enabled' : 'Not Enabled'}</span></td>
                                <td>
                                    <button class="btn-secondary" onclick="enableEmployeeLogin(${emp.id}, this)"
                                        style="padding:6px 12px;font-size:0.82rem;color:var(--primary-color)" ${!emp.hireDate ? 'disabled title="No hire date set"' : ''}>
                                        <i class="fa-solid fa-key"></i> ${hasAccount ? 'Reset Password' : 'Enable Login'}
                                    </button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (e) {
        container.innerHTML = `<p style="color:var(--danger)">Failed to load: ${e.message}</p>`;
    }
}

async function enableEmployeeLogin(empId, btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    try {
        const res = await fetchWithAuth(`/users/enable-employee/${empId}`, { method: 'POST' });
        if (!res) return;
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        showToast(`Login enabled! Username: ${data.username}. Initial password = hire date.`, 'success');
        loadEmployeesForAccess();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
        btn.disabled = false;
    }
}

async function toggleUserStatus(userId, currentStatus) {
    try {
        const res = await fetchWithAuth(`/users/${userId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: !currentStatus })
        });
        if (!res.ok) throw new Error(await res.text());
        showToast(`User ${currentStatus ? 'disabled' : 'enabled'}.`, 'success');
        loadSubAdmins();
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    }
}

function openModulesModal(userId, username, currentModules) {
    document.getElementById('editUserId').value = userId;
    document.getElementById('editingUsername').textContent = `Editing permissions for: ${username}`;
    const selected = (currentModules || '').split(',').map(m => m.trim()).filter(Boolean);
    const container = document.getElementById('moduleCheckboxes');
    container.innerHTML = ALL_MODULES.map(mod => `
        <label class="module-checkbox-item">
            <input type="checkbox" value="${mod}" ${selected.includes(mod) ? 'checked' : ''}>
            ${mod}
        </label>
    `).join('');
    document.getElementById('modulesModal').style.display = 'flex';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = type === 'error' ? 'var(--danger)' : 'var(--success)';
    toast.className = 'toast show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 4000);
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Close modals on outside click
window.addEventListener('click', e => {
    if (e.target.id === 'subAdminModal') closeSubAdminModal();
    if (e.target.id === 'modulesModal') closeModulesModal();
});
