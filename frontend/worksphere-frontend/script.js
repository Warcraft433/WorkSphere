/* ============================================================
   WorkSphere ERP – Shared Script
   Handles: Auth, API wrapper, RBAC, Theme, Profile Dropdown
   ============================================================ */

// ---- THEME INIT (must run before DOM renders to prevent flash) ----
(function() {
    const saved = localStorage.getItem('ws_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
})();

// ---- API BASE URL ----
const IS_LOCAL = window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
    || window.location.hostname === '';

const API_BASE_URL = IS_LOCAL
    ? 'http://localhost:8080/api'
    : 'https://your-production-backend.onrender.com/api';

// ---- AUTHENTICATION ----

async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        if (!response.ok) throw new Error('Invalid credentials');

        const data = await response.json();
        localStorage.setItem('jwt_token', data.token);
        window.location.href = 'index.html';
    } catch (error) {
        if (errDiv) {
            errDiv.textContent = 'Login failed: ' + error.message;
            errDiv.style.display = 'block';
        } else {
            alert('Login failed: ' + error.message);
        }
    }
}

/**
 * Fetch wrapper that automatically attaches JWT.
 * Handles 401 (redirect to login) and 403 (throw, don't redirect).
 */
async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');

    if (!token && !endpoint.includes('/auth/login')) {
        window.location.href = 'login.html';
        return null;
    }

    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const config = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    };

    // Let browser set Content-Type for FormData
    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
        throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
        throw new Error("Access Denied: You don't have permission for this action.");
    }

    return response;
}

// ---- JWT PARSER ----
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) { return null; }
}

function getCurrentUser() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    return parseJwt(token);
}

function getCurrentRole() {
    const payload = getCurrentUser();
    if (!payload || !payload.roles || !payload.roles.length) return null;
    return payload.roles[0].replace('ROLE_', '');
}

// ---- RBAC ----
function applyRoleBasedAccess() {
    const role = getCurrentRole();
    if (!role) return;

    const isEmployee = role === 'EMPLOYEE';
    const isAdmin = role === 'ADMIN';

    if (isEmployee) {
        // Employees can't see Admin-only nav items
        document.querySelectorAll('.nav-item').forEach(link => {
            const text = link.textContent.trim();
            if (['Payroll', 'Departments', 'User Management'].includes(text)) {
                link.style.display = 'none';
            }
        });
    }

    // Hide User Management from non-admins
    if (!isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
}

// ---- THEME ----
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ws_theme', next);

    // Update icon
    const btn = document.querySelector('.theme-toggle-btn');
    if (btn) {
        const icon = btn.querySelector('i');
        const label = btn.querySelector('span');
        if (next === 'dark') {
            if (icon) icon.className = 'fa-solid fa-sun';
            if (label) label.textContent = 'Light Mode';
        } else {
            if (icon) icon.className = 'fa-solid fa-moon';
            if (label) label.textContent = 'Dark Mode';
        }
    }
}

function initThemeButton() {
    const btn = document.querySelector('.theme-toggle-btn');
    if (!btn) return;
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const icon = btn.querySelector('i');
    const label = btn.querySelector('span');
    if (current === 'dark') {
        if (icon) icon.className = 'fa-solid fa-sun';
        if (label) label.textContent = 'Light Mode';
    } else {
        if (icon) icon.className = 'fa-solid fa-moon';
        if (label) label.textContent = 'Dark Mode';
    }
}

// ---- PROFILE DROPDOWN ----
function setupProfileDropdown() {
    const profileDiv = document.querySelector('.user-profile');
    if (!profileDiv) return;

    const payload = getCurrentUser();
    const nameSpan = profileDiv.querySelector('span');
    if (nameSpan && payload && payload.sub) {
        nameSpan.textContent = payload.sub;
    }

    profileDiv.style.position = 'relative';

    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    dropdown.innerHTML = `
        <a href="settings.html"><i class="fa-solid fa-user-circle"></i> Profile &amp; Settings</a>
        <a href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
    `;

    Object.assign(dropdown.style, {
        display: 'none',
        position: 'absolute',
        top: '120%',
        right: '0',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-lg)',
        padding: '8px 0',
        minWidth: '180px',
        zIndex: '1000'
    });

    dropdown.querySelectorAll('a').forEach(l => {
        Object.assign(l.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            color: 'var(--text-main)',
            textDecoration: 'none',
            fontSize: '0.88rem'
        });
        l.addEventListener('mouseover', () => l.style.backgroundColor = 'var(--secondary-color)');
        l.addEventListener('mouseout',  () => l.style.backgroundColor = 'transparent');
    });

    profileDiv.appendChild(dropdown);

    profileDiv.addEventListener('click', e => {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        e.stopPropagation();
    });

    document.addEventListener('click', () => { dropdown.style.display = 'none'; });

    document.getElementById('logoutBtn')?.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
    });
}

// ---- SIDEBAR TOGGLE ----
function initSidebar() {
    const toggleBtn = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    applyRoleBasedAccess();
    setupProfileDropdown();
    initThemeButton();
    initSidebar();
});
