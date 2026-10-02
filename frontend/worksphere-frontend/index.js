document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadEmployeeOverview();
    loadRecentActivity();
});

async function loadDashboardStats() {
    try {
        const response = await fetchWithAuth('/dashboard/stats');
        if (!response) return;

        const stats = await response.json();
        document.getElementById('totalEmployees').textContent = stats.totalEmployees;
        document.getElementById('totalDepartments').textContent = stats.totalDepartments;
        document.getElementById('pendingLeaves').textContent = stats.pendingLeaves;
        document.getElementById('presentToday').textContent = stats.presentToday ?? '–';
        document.getElementById('clockedInSub').textContent = `Currently clocked in: ${stats.clockedIn ?? 0}`;
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

async function loadEmployeeOverview() {
    const container = document.getElementById('employeeOverview');
    if (!container) return;

    try {
        const response = await fetchWithAuth('/employees?page=0&size=6');
        if (!response) return;

        const data = await response.json();
        const employees = Array.isArray(data) ? data : (data.content || []);

        if (employees.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:30px;color:var(--text-muted)">
                    <i class="fa-solid fa-users" style="font-size:2.5rem;margin-bottom:10px;display:block;opacity:0.4"></i>
                    No employees yet. <a href="employees.html" style="color:var(--primary-color)">Add the first one</a>.
                </div>`;
            Object.assign(container.style, { height: 'auto', background: 'transparent' });
            return;
        }

        container.innerHTML = `
            <ul style="list-style:none;padding:0;width:100%;margin:10px 0 0">
                ${employees.map(emp => `
                    <li style="padding:12px 16px;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div class="emp-avatar">${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}</div>
                            <div>
                                <strong style="color:var(--text-main)">${emp.firstName} ${emp.lastName}</strong><br>
                                <small style="color:var(--text-muted)">${emp.department ? emp.department.name : 'No Dept'}</small>
                            </div>
                        </div>
                        <span class="badge badge-success">Active</span>
                    </li>
                `).join('')}
                <li style="padding:12px 16px;text-align:center">
                    <a href="employees.html" style="color:var(--primary-color);font-size:0.85rem">View all employees →</a>
                </li>
            </ul>`;
        Object.assign(container.style, { height: 'auto', background: 'transparent', display: 'block' });
    } catch (e) {
        console.error('Failed to load employee overview:', e);
        container.innerHTML = '<p style="padding:20px;color:var(--text-muted)">Could not load employees.</p>';
        container.style.background = 'transparent';
    }
}

const ACTION_ICONS = {
    'EMPLOYEE_CREATED': 'fa-user-plus',
    'EMPLOYEE_DELETED': 'fa-user-minus',
    'CLOCK_IN':  'fa-calendar-check',
    'CLOCK_OUT': 'fa-calendar-xmark',
    'PAYROLL':   'fa-money-check-dollar',
    'LEAVE':     'fa-calendar-minus',
    'DEFAULT':   'fa-bell'
};

async function loadRecentActivity() {
    const container = document.getElementById('activityList');
    if (!container) return;

    try {
        const response = await fetchWithAuth('/dashboard/activity');
        if (!response) return;

        const activities = await response.json();

        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.85rem">
                    <i class="fa-solid fa-clock-rotate-left" style="font-size:1.8rem;display:block;margin-bottom:8px;opacity:0.4"></i>
                    No recent activity yet.
                </div>`;
            return;
        }

        container.innerHTML = activities.map(act => {
            const icon = ACTION_ICONS[act.actionType] || ACTION_ICONS['DEFAULT'];
            const timeAgo = getTimeAgo(act.createdAt);
            return `
                <div class="activity-item">
                    <div class="activity-icon"><i class="fa-solid ${icon}"></i></div>
                    <div class="activity-details"><p>${escapeHtml(act.description)}</p></div>
                    <div class="activity-time">${timeAgo}</div>
                </div>`;
        }).join('');
    } catch (e) {
        console.error('Failed to load activities:', e);
        container.innerHTML = '<p style="padding:10px;color:var(--text-muted);font-size:0.85rem">Could not load activity.</p>';
    }
}

function getTimeAgo(isoString) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diff < 60)   return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    } catch { return ''; }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
