const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
const API_BASE_URL = IS_LOCAL 
    ? 'http://localhost:8080/api' 
    : 'https://your-production-backend.onrender.com/api'; // Replace this with your actual Live Backend URL

// --- AUTHENTICATION & FETCH WRAPPER ---

async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        if (!response.ok) throw new Error('Invalid credentials');
        
        const data = await response.json();
        // Store JWT securely (localStorage for demo, HttpOnly Cookie for strict prod)
        localStorage.setItem('jwt_token', data.token);
        
        window.location.href = 'index.html';
    } catch (error) {
        alert("Login failed: " + error.message);
    }
}

/**
 * Standard fetch wrapper that automatically attaches the JWT token.
 * Use this for all API calls to protected endpoints.
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

    // Merge headers if provided (e.g. for multipart/form-data, Content-Type shouldn't be set to json)
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    // If body is FormData, let browser set the correct multipart content-type boundary
    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
        throw new Error("Unauthorized");
    }

    return response;
}

// --- RBAC & UI ---
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function applyRoleBasedAccess() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    const payload = parseJwt(token);
    if (!payload || !payload.roles) return;

    const isEmployee = payload.roles.includes("ROLE_EMPLOYEE");
    
    if (isEmployee) {
        document.querySelectorAll('.nav-item').forEach(link => {
            const text = link.textContent.trim();
            if (['Payroll', 'Departments', 'Settings'].includes(text)) {
                link.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyRoleBasedAccess();
    
    const toggleBtn = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
        });
    }
});
