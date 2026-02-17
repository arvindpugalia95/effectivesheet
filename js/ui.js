// UI Update Module

// Update the client list display
function updateClientList() {
    const clientListDiv = document.getElementById('clientList');
    
    if (STATE.clientsList.length === 0) {
        clientListDiv.innerHTML = '<span class="text-sm text-gray-500 italic">No clients added yet</span>';
        return;
    }
    
    clientListDiv.innerHTML = STATE.clientsList.map(client => 
        `<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">${client}</span>`
    ).join('');
}

// Update the project client select dropdown
function updateProjectClientSelect() {
    const select = document.getElementById('projectClientSelect');
    select.innerHTML = '<option value="">Select Client...</option>';
    
    STATE.clientsList.forEach(client => {
        const option = document.createElement('option');
        option.value = client;
        option.textContent = client;
        select.appendChild(option);
    });
}

// Update the project list display
function updateProjectList() {
    const projectListDiv = document.getElementById('projectList');
    
    if (Object.keys(STATE.projectsMap).length === 0) {
        projectListDiv.innerHTML = '<span class="text-sm text-gray-500 italic">No projects added yet</span>';
        return;
    }
    
    let html = '';
    for (let client in STATE.projectsMap) {
        html += `<div class="bg-white p-3 rounded-lg border border-green-200">
            <p class="font-semibold text-green-900 mb-2">${client}:</p>
            <div class="flex flex-wrap gap-2">`;
        
        STATE.projectsMap[client].forEach(project => {
            html += `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">${project}</span>`;
        });
        
        html += `</div></div>`;
    }
    
    projectListDiv.innerHTML = html;
}

// Add a new row to the data entry table
function addNewRow() {
    const tbody = document.getElementById('dataTableBody');
    const rowId = STATE.rowCounter++;
    
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    row.id = `row-${rowId}`;
    
    const today = new Date().toISOString().split('T')[0];
    
    row.innerHTML = `
        <td class="border border-gray-300 p-2">
            <input type="date" class="row-date w-full p-2 border-0 focus:ring-2 focus:ring-blue-500 rounded" value="${today}" required>
        </td>
        <td class="border border-gray-300 p-2">
            <select class="row-client w-full p-2 border-0 focus:ring-2 focus:ring-blue-500 rounded" required onchange="updateProjectDropdown(${rowId})">
                <option value="">Select Client...</option>
                ${STATE.clientsList.map(client => `<option value="${client}">${client}</option>`).join('')}
            </select>
        </td>
        <td class="border border-gray-300 p-2">
            <select class="row-project w-full p-2 border-0 focus:ring-2 focus:ring-blue-500 rounded" required>
                <option value="">Select Client First...</option>
            </select>
        </td>
        <td class="border border-gray-300 p-2">
            <textarea class="row-activity w-full p-2 border-0 focus:ring-2 focus:ring-blue-500 rounded resize-y min-h-[60px]" placeholder="Activity description" required rows="2"></textarea>
        </td>
        <td class="border border-gray-300 p-2">
            <input type="number" class="row-clockify w-full p-2 border-0 focus:ring-2 focus:ring-blue-500 rounded" step="0.25" min="0" placeholder="0.0" required>
        </td>
        <td class="border border-gray-300 p-2">
            <input type="number" class="row-effective w-full p-2 border-0 focus:ring-2 focus:ring-blue-500 rounded" step="0.25" min="0" placeholder="0.0" required>
        </td>
        <td class="border border-gray-300 p-2">
            <select class="row-type w-full p-2 border-0 focus:ring-2 focus:ring-blue-500 rounded" required>
                <option value="">Select...</option>
                <option value="Recurring">Recurring</option>
                <option value="Adhoc">Adhoc</option>
            </select>
        </td>
        <td class="border border-gray-300 p-2">
            <select class="row-user w-full p-2 border-0 focus:ring-2 focus:ring-blue-500 rounded" required>
                <option value="${STATE.currentUser}" selected>${STATE.currentUser}</option>
            </select>
        </td>
        <td class="border border-gray-300 p-2 text-center">
            <button onclick="deleteRow(${rowId})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
        </td>
    `;
    
    tbody.appendChild(row);
}

// Update project dropdown when client is selected
window.updateProjectDropdown = function(rowId) {
    const row = document.getElementById(`row-${rowId}`);
    const clientSelect = row.querySelector('.row-client');
    const projectSelect = row.querySelector('.row-project');
    
    const selectedClient = clientSelect.value;
    
    if (!selectedClient) {
        projectSelect.innerHTML = '<option value="">Select Client First...</option>';
        return;
    }
    
    const projects = STATE.projectsMap[selectedClient] || [];
    
    if (projects.length === 0) {
        projectSelect.innerHTML = '<option value="">No projects for this client</option>';
        return;
    }
    
    projectSelect.innerHTML = '<option value="">Select Project...</option>' + 
        projects.map(project => `<option value="${project}">${project}</option>`).join('');
};

// Delete a row from the table
window.deleteRow = function(rowId) {
    const row = document.getElementById(`row-${rowId}`);
    if (row) {
        row.remove();
    }
};

// Show status message
function showStatusMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    const className = type === 'success' 
        ? 'mt-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg'
        : 'mt-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg';
    
    statusDiv.className = className;
    statusDiv.textContent = message;
    statusDiv.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 3000);
    }
}

// Show client master status
function showClientStatus(message, type) {
    const statusDiv = document.getElementById('clientMasterStatus');
    const className = type === 'success'
        ? 'mt-3 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg'
        : 'mt-3 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg';
    
    statusDiv.className = className;
    statusDiv.textContent = message;
    statusDiv.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 3000);
    }
}

// Show project master status
function showProjectStatus(message, type) {
    const statusDiv = document.getElementById('projectMasterStatus');
    const className = type === 'success'
        ? 'mt-3 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg'
        : 'mt-3 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg';
    
    statusDiv.className = className;
    statusDiv.textContent = message;
    statusDiv.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.classList.add('hidden');
        }, 3000);
    }
}
