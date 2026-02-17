// Main Application Logic

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Test Connection Button
    const testConnectionBtn = document.getElementById('testConnectionBtn');
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', testConnection);
    }

    // Refresh buttons
    const refreshClientsBtn = document.getElementById('refreshClientsBtn');
    if (refreshClientsBtn) {
        refreshClientsBtn.addEventListener('click', async () => {
            refreshClientsBtn.disabled = true;
            refreshClientsBtn.textContent = 'Loading...';
            await loadClients();
            refreshClientsBtn.disabled = false;
            refreshClientsBtn.textContent = '🔄 Refresh';
        });
    }

    const refreshProjectsBtn = document.getElementById('refreshProjectsBtn');
    if (refreshProjectsBtn) {
        refreshProjectsBtn.addEventListener('click', async () => {
            refreshProjectsBtn.disabled = true;
            refreshProjectsBtn.textContent = 'Loading...';
            await loadProjects();
            refreshProjectsBtn.disabled = false;
            refreshProjectsBtn.textContent = '🔄 Refresh';
        });
    }

    // Add client button
    const addClientBtn = document.getElementById('addClientBtn');
    if (addClientBtn) {
        addClientBtn.addEventListener('click', handleAddClient);
    }

    // Add project button
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', handleAddProject);
    }

    // Add row button
    const addRowBtn = document.getElementById('addRowBtn');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', addNewRow);
    }

    // Submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
}

// Handle adding a new client
async function handleAddClient() {
    const newClientName = document.getElementById('newClientName').value.trim();
    const addBtn = document.getElementById('addClientBtn');
    
    if (!newClientName) {
        showClientStatus('❌ Please enter a client name!', 'error');
        return;
    }

    addBtn.disabled = true;
    addBtn.textContent = 'Adding...';
    
    try {
        const result = await addClient(newClientName);
        
        if (result.status === 'success') {
            showClientStatus('✅ Client added successfully!', 'success');
            
            STATE.clientsList = result.clients || [...STATE.clientsList, newClientName];
            updateClientList();
            updateProjectClientSelect();
            
            document.getElementById('newClientName').value = '';
        } else {
            showClientStatus('❌ ' + result.message, 'error');
        }
        
    } catch (error) {
        showClientStatus('❌ ' + error.message, 'error');
    } finally {
        addBtn.disabled = false;
        addBtn.textContent = 'Add Client';
    }
}

// Handle adding a new project
async function handleAddProject() {
    const clientName = document.getElementById('projectClientSelect').value;
    const projectName = document.getElementById('newProjectName').value.trim();
    const addBtn = document.getElementById('addProjectBtn');
    
    if (!clientName || !projectName) {
        showProjectStatus('❌ Please select a client and enter a project name!', 'error');
        return;
    }

    addBtn.disabled = true;
    addBtn.textContent = 'Adding...';
    
    try {
        const result = await addProject(clientName, projectName);
        
        if (result.status === 'success') {
            showProjectStatus('✅ Project added successfully!', 'success');
            
            STATE.projectsMap = result.projects || STATE.projectsMap;
            updateProjectList();
            
            document.getElementById('newProjectName').value = '';
            document.getElementById('projectClientSelect').value = '';
        } else {
            showProjectStatus('❌ ' + result.message, 'error');
        }
        
    } catch (error) {
        showProjectStatus('❌ ' + error.message, 'error');
    } finally {
        addBtn.disabled = false;
        addBtn.textContent = 'Add Project';
    }
}

// Handle form submission
async function handleSubmit() {
    const submitBtn = document.getElementById('submitBtn');
    const tbody = document.getElementById('dataTableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        showStatusMessage('❌ No entries to submit!', 'error');
        return;
    }

    const activities = [];
    let hasError = false;
    
    rows.forEach((row, index) => {
        const date = row.querySelector('.row-date').value;
        const client = row.querySelector('.row-client').value;
        const project = row.querySelector('.row-project').value;
        const activity = row.querySelector('.row-activity').value;
        const clockify = row.querySelector('.row-clockify').value;
        const effective = row.querySelector('.row-effective').value;
        const type = row.querySelector('.row-type').value;
        const user = row.querySelector('.row-user').value;
        
        if (!date || !client || !project || !activity || !clockify || !effective || !type || !user) {
            hasError = true;
            row.classList.add('bg-red-50');
        } else {
            row.classList.remove('bg-red-50');
            activities.push({
                date, 
                clientName: client, 
                project, 
                activity,
                clockifyHours: clockify, 
                effectiveHours: effective,
                type, 
                user
            });
        }
    });
    
    if (hasError) {
        showStatusMessage('❌ Please fill in all fields in all rows!', 'error');
        return;
    }

    if (CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        showStatusMessage('⚠️ Please configure your Google Apps Script Web App URL first', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        await submitActivities(activities);
        
        showStatusMessage(`✅ Successfully submitted ${activities.length} ${activities.length === 1 ? 'entry' : 'entries'}!`, 'success');
        
        // Clear all rows and add one fresh row
        tbody.innerHTML = '';
        STATE.rowCounter = 0;
        addNewRow();
        
    } catch (error) {
        showStatusMessage('❌ ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit All Entries';
    }
}
