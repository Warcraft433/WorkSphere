document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await changePassword();
    });
});

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function loadProfile() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const payload = parseJwt(token);
        if (payload) {
            document.getElementById('profileUsername').textContent = payload.sub || 'Unknown';
            document.getElementById('profileRole').textContent = (payload.roles || 'USER').replace('ROLE_', '');
        }
    } catch (e) {
        console.error("Failed to parse JWT for profile");
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showToast("New passwords do not match!", "error");
        return;
    }

    try {
        const res = await fetchWithAuth('/users/me/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (res.ok) {
            showToast("Password updated successfully! Please login again.");
            document.getElementById('passwordForm').reset();
            setTimeout(logout, 2000);
        } else {
            const errorText = await res.text();
            showToast(`Failed: ${errorText}`, "error");
        }
    } catch (e) {
        showToast("An error occurred", "error");
    }
}

function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}
