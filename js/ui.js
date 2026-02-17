// API Communication Module

// Test connection to Google Apps Script
async function testConnection() {
    const btn = document.getElementById('testConnectionBtn');
    const resultDiv = document.getElementById('testResult');
    
    btn.disabled = true;
    btn.textContent = 'Testing...';
    resultDiv.classList.remove('hidden');
    resultDiv.className = 'mt-3 p-3 bg-blue-100 border border-blue-400 text-blue-800 rounded-lg';
    resultDiv.innerHTML = '🔄 Testing connection...';
    
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=getClients';
        console.log('Testing URL:', url);
        
        const response = await fetch(url);
        const text = await response.text();
        
        if (!response.ok) {
            resultDiv.className = 'mt-3 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg';
            resultDiv.innerHTML = `❌ <strong>HTTP Error ${response.status}</strong>`;
            return;
        }
        
        const result = JSON.parse(text);
        
        if (result.status === 'success') {
            resultDiv.className = 'mt-3 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg';
            resultDiv.innerHTML = `✅ <strong>Connection Successful!</strong><br><span class="text-sm">Clients found: ${result.clients.length}</span>`;
        } else {
            resultDiv.className = 'mt-3 p-3 bg-orange-100 border border-orange-400 text-orange-800 rounded-lg';
            resultDiv.innerHTML = `⚠️ <strong>Script Error:</strong> ${result.message}`;
        }
        
    } catch (error) {
        console.error('Connection test failed:', error);
        resultDiv.className = 'mt-3 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg';
        resultDiv.innerHTML = `❌ <strong>Connection Failed: ${error.message}</strong>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Test Connection';
    }
}

// Load clients from Google Sheets
async function loadClients() {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=getClients&t=' + Date.now();
        const response = await fetch(url, { method: 'GET', redirect: 'follow', mode: 'cors' });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const text = await response.text();
        const result = JSON.parse(text);
        
        if (result.status === 'success') {
            STATE.clientsList = result.clients || [];
            updateClientList();
            updateProjectClientSelect();
        } else {
            throw new Error(result.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error loading clients:', error);
        const clientListDiv = document.getElementById('clientList');
        clientListDiv.innerHTML = `<span class="text-sm text-red-600">⚠️ Error: ${error.message}</span>`;
    }
}

// Load projects from Google Sheets
async function loadProjects() {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=getProjects&t=' + Date.now();
        const response = await fetch(url, { method: 'GET', redirect: 'follow', mode: 'cors' });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const text = await response.text();
        const result = JSON.parse(text);
        
        if (result.status === 'success') {
            STATE.projectsMap = result.projects || {};
            updateProjectList();
        } else {
            throw new Error(result.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        const projectListDiv = document.getElementById('projectList');
        projectListDiv.innerHTML = `<span class="text-sm text-red-600">⚠️ Error: ${error.message}</span>`;
    }
}

// Load admins
async function loadAdmins() {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=getAdmins&t=' + Date.now();
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.status === 'success') {
            STATE.adminsList = result.admins || [];
        }
    } catch (error) {
        console.error('Error loading admins:', error);
    }
}

// Load pending approvals (for admins)
async function loadPendingApprovals() {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=getPendingApprovals&approver=' + encodeURIComponent(STATE.currentUser) + '&t=' + Date.now();
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.status === 'success') {
            displayPendingApprovals(result.approvals || []);
        }
    } catch (error) {
        console.error('Error loading approvals:', error);
        document.getElementById('approvalsList').innerHTML = `<span class="text-sm text-red-600">⚠️ Error loading approvals</span>`;
    }
}

// Load rejected submissions (for data users)
async function loadRejectedSubmissions() {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=getRejectedSubmissions&username=' + encodeURIComponent(STATE.currentUser) + '&t=' + Date.now();
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.status === 'success') {
            displayRejectedSubmissions(result.rejected || []);
        }
    } catch (error) {
        console.error('Error loading rejected submissions:', error);
        document.getElementById('rejectedList').innerHTML = `<span class="text-sm text-red-600">⚠️ Error loading rejected submissions</span>`;
    }
}

// Add a new client
async function addClient(clientName) {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=addClient&clientName=' + encodeURIComponent(clientName);
        const response = await fetch(url);
        const result = await response.json();
        return result;
    } catch (error) {
        throw new Error('Error adding client: ' + error.message);
    }
}

// Add a new project
async function addProject(clientName, projectName) {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=addProject&clientName=' + encodeURIComponent(clientName) + '&projectName=' + encodeURIComponent(projectName);
        const response = await fetch(url);
        const result = await response.json();
        return result;
    } catch (error) {
        throw new Error('Error adding project: ' + error.message);
    }
}

// Submit activities (admin direct or data for approval)
async function submitActivities(activities) {
    try {
        const action = STATE.userRole === 'admin' ? 'submitActivities' : 'submitForApproval';
        const payload = {
            action: action,
            activities: activities
        };
        
        if (STATE.userRole !== 'admin') {
            payload.submittedBy = STATE.currentUser;
        }
        
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        return { status: 'success' };
    } catch (error) {
        throw new Error('Error submitting activities: ' + error.message);
    }
}

// Approve submission
async function approveSubmission(submissionId) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'approveSubmission',
                submissionId: submissionId
            })
        });
        return { status: 'success' };
    } catch (error) {
        throw new Error('Error approving: ' + error.message);
    }
}

// Reject submission
async function rejectSubmission(submissionId) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'rejectSubmission',
                submissionId: submissionId
            })
        });
        return { status: 'success' };
    } catch (error) {
        throw new Error('Error rejecting: ' + error.message);
    }
}

// Delete rejected submission
async function deleteRejectedSubmission(submissionId) {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=deleteRejectedSubmission&submissionId=' + encodeURIComponent(submissionId);
        const response = await fetch(url);
        const result = await response.json();
        return result;
    } catch (error) {
        throw new Error('Error deleting: ' + error.message);
    }
}
