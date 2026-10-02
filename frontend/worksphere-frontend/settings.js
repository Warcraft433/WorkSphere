document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    initThemeButtons();

    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await changePassword();
    });
});

function loadProfile() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const payload = parseJwt(token);
        if (!payload) return;

        const username = payload.sub || 'Unknown';
        let role = 'USER';
        if (payload.roles && payload.roles.length > 0) {
            role = payload.roles[0].replace('ROLE_', '');
        }

        // Header elements
        document.getElementById('profileUsername').textContent = username;
        document.getElementById('profileRole').textContent = role;

        // Profile details
        const usernameFullEl = document.getElementById('profileUsernameFull');
        if (usernameFullEl) usernameFullEl.textContent = username;

        const roleEl = document.getElementById('profileRoleBadge');
        if (roleEl) {
            const badgeClass = role === 'ADMIN' ? 'badge-danger' : role === 'SUB_ADMIN' ? 'badge-warning' : 'badge-primary';
            roleEl.innerHTML = `<span class="badge ${badgeClass}">${role}</span>`;
        }
    } catch (e) {
        console.error('Failed to parse JWT for profile:', e);
    }
}

function initThemeButtons() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeButtonStyles(current);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ws_theme', theme);
    updateThemeButtonStyles(theme);

    // Also update header button
    const headerBtn = document.querySelector('.theme-toggle-btn');
    if (headerBtn) {
        const icon = headerBtn.querySelector('i');
        const label = headerBtn.querySelector('span');
        if (theme === 'dark') {
            if (icon) icon.className = 'fa-solid fa-sun';
            if (label) label.textContent = 'Light Mode';
        } else {
            if (icon) icon.className = 'fa-solid fa-moon';
            if (label) label.textContent = 'Dark Mode';
        }
    }
}

function updateThemeButtonStyles(theme) {
    const lightBtn = document.getElementById('lightThemeBtn');
    const darkBtn = document.getElementById('darkThemeBtn');
    if (!lightBtn || !darkBtn) return;

    if (theme === 'light') {
        lightBtn.style.borderColor = 'var(--primary-color)';
        lightBtn.style.color = 'var(--primary-color)';
        lightBtn.style.background = 'rgba(75,110,245,0.08)';
        darkBtn.style.borderColor = 'var(--border-color)';
        darkBtn.style.color = 'var(--text-muted)';
        darkBtn.style.background = '';
    } else {
        darkBtn.style.borderColor = 'var(--primary-color)';
        darkBtn.style.color = 'var(--primary-color)';
        darkBtn.style.background = 'rgba(75,110,245,0.08)';
        lightBtn.style.borderColor = 'var(--border-color)';
        lightBtn.style.color = 'var(--text-muted)';
        lightBtn.style.background = '';
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const errDiv = document.getElementById('pwdError');
    const successDiv = document.getElementById('pwdSuccess');
    errDiv.style.display = 'none';
    successDiv.style.display = 'none';

    if (newPassword !== confirmPassword) {
        errDiv.textContent = 'New passwords do not match.';
        errDiv.style.display = 'block';
        return;
    }

    if (newPassword.length < 6) {
        errDiv.textContent = 'Password must be at least 6 characters.';
        errDiv.style.display = 'block';
        return;
    }

    const btn = document.getElementById('updatePwdBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

    try {
        const res = await fetchWithAuth('/users/me/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (!res) return;

        if (res.ok) {
            successDiv.textContent = 'Password updated! Logging you out in 2 seconds...';
            successDiv.style.display = 'block';
            document.getElementById('passwordForm').reset();
            setTimeout(logout, 2000);
        } else {
            const errorText = await res.text();
            errDiv.textContent = `Failed: ${errorText}`;
            errDiv.style.display = 'block';
        }
    } catch (e) {
        errDiv.textContent = 'An unexpected error occurred.';
        errDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Password';
    }
}

function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
    toast.className = 'toast show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}
