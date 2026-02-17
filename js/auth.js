// Authentication Module

// Check if user is already logged in on page load
window.addEventListener('load', () => {
    const savedUser = sessionStorage.getItem('loggedInUser');
    const savedRole = sessionStorage.getItem('userRole');
    if (savedUser && savedRole) {
        STATE.currentUser = savedUser;
        STATE.userRole = savedRole;
        showMainApp();
    }
});

// Login functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const loginPassword = document.getElementById('loginPassword');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Allow Enter key to login
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    
    if (!username || !password) {
        showError(errorDiv, 'Please enter both username and password');
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    errorDiv.classList.add('hidden');
    
    try {
        const url = `${CONFIG.GOOGLE_SCRIPT_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        console.log('Login URL:', url);
        
        const response = await fetch(url);
        console.log('Login response status:', response.status);
        
        const text = await response.text();
        console.log('Login response text:', text);
        
        const result = JSON.parse(text);
        console.log('Login result:', result);
        
        if (result.status === 'success') {
            STATE.currentUser = username;
            STATE.userRole = result.role || 'data';
            sessionStorage.setItem('loggedInUser', username);
            sessionStorage.setItem('userRole', STATE.userRole);
            showMainApp();
        } else {
            showError(errorDiv, result.message || 'Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(errorDiv, 'Login error: ' + error.message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

function handleLogout() {
    STATE.currentUser = null;
    STATE.userRole = null;
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('userRole');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

function showMainApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('loggedInUser').textContent = STATE.currentUser;
    document.getElementById('userRole').textContent = `Role: ${STATE.userRole}`;
    
    // Show/hide sections based on role
    if (STATE.userRole === 'admin') {
        document.getElementById('adminApprovalSection').classList.remove('hidden');
        document.getElementById('rejectedSection').classList.add('hidden');
        document.getElementById('adminColumnHeader').classList.add('hidden');
        document.getElementById('submitBtnText').textContent = 'Submit All Entries (Direct)';
    } else {
        document.getElementById('adminApprovalSection').classList.add('hidden');
        document.getElementById('rejectedSection').classList.remove('hidden');
        document.getElementById('adminColumnHeader').classList.remove('hidden');
        document.getElementById('submitBtnText').textContent = 'Submit for Approval';
    }
    
    // Initialize the app
    loadClients();
    loadProjects();
    
    if (STATE.userRole === 'admin') {
        loadPendingApprovals();
    } else {
        loadAdmins();
        loadRejectedSubmissions();
    }
    
    addNewRow();
}

function showError(element, message) {
    element.textContent = '❌ ' + message;
    element.classList.remove('hidden');
}
