document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const response = await fetchWithAuth('/dashboard/stats');
        if (!response) return; // already handles redirect if unauthorized
        
        const stats = await response.json();
        
        document.getElementById('totalEmployees').textContent = stats.totalEmployees;
        document.getElementById('totalDepartments').textContent = stats.totalDepartments;
        document.getElementById('pendingLeaves').textContent = stats.pendingLeaves;
    } catch (error) {
        console.error("Failed to load dashboard stats", error);
    }
}
