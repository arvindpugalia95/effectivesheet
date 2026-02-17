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
        console.log('Response received:', response);
        console.log('Response status:', response.status);
        
        const text = await response.text();
        console.log('Response text:', text);
        
        if (!response.ok) {
            resultDiv.className = 'mt-3 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg';
            resultDiv.innerHTML = `❌ <strong>HTTP Error ${response.status}</strong><br>
                <span class="text-sm">The script returned an error. This usually means:</span><br>
                <ul class="text-sm list-disc ml-5 mt-2">
                    <li>Script not deployed properly</li>
                    <li>"Who has access" not set to "Anyone"</li>
                    <li>Wrong URL in the config.js file</li>
                </ul>`;
            return;
        }
        
        const result = JSON.parse(text);
        console.log('Parsed result:', result);
        
        if (result.status === 'success') {
            resultDiv.className = 'mt-3 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg';
            resultDiv.innerHTML = `✅ <strong>Connection Successful!</strong><br>
                <span class="text-sm">Script is working correctly.</span><br>
                <span class="text-sm">Clients found: ${result.clients.length}</span>`;
        } else {
            resultDiv.className = 'mt-3 p-3 bg-orange-100 border border-orange-400 text-orange-800 rounded-lg';
            resultDiv.innerHTML = `⚠️ <strong>Script Error:</strong> ${result.message}`;
        }
        
    } catch (error) {
        console.error('Connection test failed:', error);
        resultDiv.className = 'mt-3 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg';
        resultDiv.innerHTML = `❌ <strong>Connection Failed: ${error.message}</strong><br>
            <span class="text-sm mt-2 block">Common causes:</span>
            <ul class="text-sm list-disc ml-5 mt-1">
                <li><strong>CORS Error:</strong> Script not properly deployed or "Who has access" not set to "Anyone"</li>
                <li><strong>Network Error:</strong> Check your internet connection</li>
                <li><strong>Authorization Required:</strong> Open the script URL directly in browser to authorize</li>
            </ul>
            <div class="mt-2 text-sm">
                <strong>Try this:</strong> Open this URL in a new tab:<br>
                <a href="${CONFIG.GOOGLE_SCRIPT_URL}?action=getClients" target="_blank" class="text-blue-600 underline break-all">${CONFIG.GOOGLE_SCRIPT_URL}?action=getClients</a>
            </div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Test Connection';
    }
}

// Load clients from Google Sheets
async function loadClients() {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=getClients&t=' + Date.now();
        console.log('Fetching clients from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors'
        });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Response text:', text);
        
        const result = JSON.parse(text);
        console.log('Parsed result:', result);
        
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
        clientListDiv.innerHTML = `<span class="text-sm text-red-600">⚠️ Error: ${error.message}. Click refresh to try again.</span>`;
    }
}

// Load projects from Google Sheets
async function loadProjects() {
    try {
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?action=getProjects&t=' + Date.now();
        console.log('Fetching projects from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
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
        projectListDiv.innerHTML = `<span class="text-sm text-red-600">⚠️ Error: ${error.message}. Click refresh to try again.</span>`;
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

// Submit activities
async function submitActivities(activities) {
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'submitActivities',
                activities: activities
            })
        });
        return { status: 'success' };
    } catch (error) {
        throw new Error('Error submitting activities: ' + error.message);
    }
}
