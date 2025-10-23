// Popup script for managing settings
document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  loadSettings();
  
  // Save settings button
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Test connection button
  document.getElementById('test-connection').addEventListener('click', testConnection);
});

async function loadSettings() {
  try {
    const result = await browser.storage.local.get(['canvasToken', 'canvasUrl']);
    
    if (result.canvasUrl) {
      document.getElementById('canvas-url').value = result.canvasUrl;
    }
    
    if (result.canvasToken) {
      document.getElementById('canvas-token').value = result.canvasToken;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  const canvasUrl = document.getElementById('canvas-url').value.trim();
  const canvasToken = document.getElementById('canvas-token').value.trim();
  
  if (!canvasUrl || !canvasToken) {
    showStatus('Please fill in both fields', 'error');
    return;
  }
  
  try {
    await browser.storage.local.set({
      canvasUrl: canvasUrl,
      canvasToken: canvasToken
    });
    
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, 'error');
  }
}

async function testConnection() {
  const canvasUrl = document.getElementById('canvas-url').value.trim();
  const canvasToken = document.getElementById('canvas-token').value.trim();
  
  if (!canvasUrl || !canvasToken) {
    showStatus('Please fill in both fields first', 'error');
    return;
  }
  
  showStatus('Testing connection...', 'success');
  
  try {
    const response = await browser.runtime.sendMessage({
      action: "fetchGrades",
      token: canvasToken,
      canvasUrl: canvasUrl
    });
    
    if (response.success) {
      showStatus(`Connection successful! Found ${response.data.length} courses with grades.`, 'success');
    } else {
      showStatus('Connection failed: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('Connection test failed: ' + error.message, 'error');
  }
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}