// Configuration file
// IMPORTANT: Replace this URL with your Google Apps Script Web App URL
const CONFIG = {
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzlKdHrNToeJrV9X6Z4bV_QC0rL9HzhW7i_QjFFEmM-Bmypbkf7aJrF1VWB0pM6TXo8/exec'
};

// Global state
const STATE = {
    currentUser: null,
    clientsList: [],
    projectsMap: {}, // { clientName: [project1, project2, ...] }
    rowCounter: 0
};
