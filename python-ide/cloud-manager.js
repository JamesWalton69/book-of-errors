class CloudManager {
    constructor() {
        this.providers = {
            googledrive: {
                name: 'Google Drive',
                connected: false,
                client: null,
                token: null,
                features: ['15GB free storage', 'Real-time collaboration', 'Version history', 'Sharing controls', 'Google Workspace integration']
            },
            dropbox: {
                name: 'Dropbox',
                connected: false,
                client: null,
                token: null,
                features: ['2GB free storage', 'File versioning', 'Link sharing', 'Team collaboration', 'Smart sync']
            },
            onedrive: {
                name: 'OneDrive',
                connected: false,
                client: null,
                token: null,
                features: ['5GB free storage', 'Office integration', 'Personal vault', 'Photo backup', 'Cross-platform sync']
            },
            github: {
                name: 'GitHub',
                connected: false,
                client: null,
                token: null,
                features: ['Unlimited public repos', 'Version control', 'Issue tracking', 'Pull requests', 'GitHub Actions']
            }
        };
        
        this.currentProvider = null;
        this.isVisible = false;
        this.syncStatus = 'idle'; // idle, syncing, error
        this.cloudFiles = new Map();
        this.templates = new Map();
        
        this.initializeTemplates();
        this.setupEventListeners();
        this.loadStoredConnections();
    }

    initializeTemplates() {
        // Initialize sample templates
        this.templates.set('data_science_starter', {
            name: 'Data Science Starter',
            description: 'Complete data analysis project template',
            files: [
                {
                    name: 'main.py',
                    content: `# Data Science Project Template
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load sample data
data = pd.DataFrame({
    'x': np.random.randn(100),
    'y': np.random.randn(100)
})

# Basic analysis
print(f"Data shape: {data.shape}")
print(f"Data describe:\\n{data.describe()}")

# Visualization
plt.figure(figsize=(10, 6))
plt.scatter(data['x'], data['y'], alpha=0.7)
plt.title('Sample Data Visualization')
plt.xlabel('X Values')
plt.ylabel('Y Values')
plt.grid(True, alpha=0.3)
plt.show()`
                },
                {
                    name: 'requirements.txt',
                    content: `pandas>=1.5.0
numpy>=1.21.0
matplotlib>=3.5.0
seaborn>=0.11.0
scikit-learn>=1.1.0`
                },
                {
                    name: 'README.md',
                    content: `# Data Science Starter Project

This is a template for data science projects using Python.

## Features
- Data loading and preprocessing
- Statistical analysis
- Data visualization
- Machine learning models

## Getting Started
1. Install requirements: \`pip install -r requirements.txt\`
2. Run the main analysis: \`python main.py\`
3. Customize for your specific dataset`
                }
            ]
        });
        
        this.templates.set('web_scraper', {
            name: 'Web Scraper Template',
            description: 'Template for web scraping projects',
            files: [
                {
                    name: 'scraper.py',
                    content: `# Web Scraping Template
import requests
from bs4 import BeautifulSoup
import json
import time

class WebScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.data = []
    
    def scrape_page(self, url):
        """Scrape a single page"""
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            print(f"Error scraping {url}: {e}")
            return None
    
    def extract_data(self, soup):
        """Extract data from parsed HTML"""
        # Customize this method for your specific needs
        data = {
            'title': soup.find('title').text if soup.find('title') else 'No title',
            'links': [link.get('href') for link in soup.find_all('a', href=True)],
            'text_length': len(soup.get_text())
        }
        return data
    
    def run(self):
        """Main scraping loop"""
        soup = self.scrape_page(self.base_url)
        if soup:
            data = self.extract_data(soup)
            self.data.append(data)
            print(f"Scraped data: {data}")
        
        return self.data

# Example usage
if __name__ == "__main__":
    scraper = WebScraper("https://example.com")
    results = scraper.run()
    print(f"Total results: {len(results)}")`
                }
            ]
        });
    }

    setupEventListeners() {
        // Cloud toggle button
        document.getElementById('cloud-toggle-btn')?.addEventListener('click', () => {
            this.toggleCloudPanel();
        });

        // Provider tabs
        document.querySelectorAll('.provider-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.selectProvider(tab.dataset.provider);
            });
        });

        // Connect button
        document.getElementById('connect-btn')?.addEventListener('click', () => {
            this.showAuthModal();
        });

        // Cloud actions
        document.getElementById('refresh-cloud')?.addEventListener('click', () => {
            this.refreshCloudFiles();
        });

        document.getElementById('new-cloud-folder')?.addEventListener('click', () => {
            this.createCloudFolder();
        });

        // Templates
        document.querySelectorAll('.template-use-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.closest('.template-card').dataset.template;
                this.useTemplate(templateId);
            });
        });

        // Import/Export
        document.querySelectorAll('.import-export-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchImportExportTab(tab.dataset.tab);
            });
        });

        document.getElementById('import-selected')?.addEventListener('click', () => {
            this.importSelectedFiles();
        });

        document.getElementById('export-files')?.addEventListener('click', () => {
            this.exportFiles();
        });

        // Auth modal
        document.getElementById('start-auth')?.addEventListener('click', () => {
            this.startAuthentication();
        });

        // Auto-sync setup
        setInterval(() => {
            if (this.currentProvider && this.providers[this.currentProvider].connected) {
                this.performAutoSync();
            }
        }, 30000); // Sync every 30 seconds
    }

    toggleCloudPanel() {
        const panel = document.getElementById('cloud-panel');
        if (!panel) return;

        this.isVisible = !this.isVisible;
        panel.classList.toggle('hidden', !this.isVisible);
        panel.classList.toggle('open', this.isVisible);

        // Update button state
        const toggleBtn = document.getElementById('cloud-toggle-btn');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', this.isVisible);
        }
    }

    selectProvider(providerId) {
        if (!this.providers[providerId]) return;

        this.currentProvider = providerId;
        
        // Update UI
        document.querySelectorAll('.provider-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.provider === providerId);
            tab.classList.toggle('connected', this.providers[providerId].connected);
        });

        this.updateConnectionStatus();
        this.updateCloudFiles();
    }

    updateConnectionStatus() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        const connectBtn = document.getElementById('connect-btn');

        if (!this.currentProvider) {
            statusText.textContent = 'No provider selected';
            statusDot.className = 'status-dot disconnected';
            connectBtn.textContent = 'Select Provider';
            connectBtn.disabled = true;
            return;
        }

        const provider = this.providers[this.currentProvider];
        
        if (provider.connected) {
            statusText.textContent = `Connected to ${provider.name}`;
            statusDot.className = 'status-dot connected';
            connectBtn.textContent = 'Disconnect';
            connectBtn.disabled = false;
        } else {
            statusText.textContent = 'Not connected';
            statusDot.className = 'status-dot disconnected';
            connectBtn.textContent = 'Connect';
            connectBtn.disabled = false;
        }
    }

    showAuthModal() {
        if (!this.currentProvider) return;

        const modal = document.getElementById('cloud-auth-modal');
        const provider = this.providers[this.currentProvider];

        // Update modal content
        document.getElementById('auth-provider-name').textContent = provider.name;
        document.getElementById('auth-provider-title').textContent = provider.name;
        document.getElementById('auth-provider-desc').textContent = `Connect your ${provider.name} account to sync files across devices.`;

        // Update features list
        const featuresList = document.getElementById('auth-features-list');
        featuresList.innerHTML = provider.features.map(feature => `<li>${feature}</li>`).join('');

        // Update provider icon
        const iconContainer = document.getElementById('auth-provider-icon');
        iconContainer.innerHTML = this.getProviderIcon(this.currentProvider);

        modal.classList.remove('hidden');
    }

    hideAuthModal() {
        const modal = document.getElementById('cloud-auth-modal');
        modal.classList.add('hidden');
    }

    getProviderIcon(providerId) {
        const icons = {
            googledrive: `<svg width="48" height="48" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M7 4L12 12H2L7 4z"/>
                <path fill="#EA4335" d="M12 12L17 4L22 12z"/>
                <path fill="#34A853" d="M2 12H22L15 20H9z"/>
            </svg>`,
            dropbox: `<svg width="48" height="48" viewBox="0 0 24 24">
                <path fill="#0061FF" d="M6 2L12 8L6 14L0 8L6 2zM18 2L24 8L18 14L12 8L18 2zM12 16L18 22L12 28L6 22L12 16z"/>
            </svg>`,
            onedrive: `<svg width="48" height="48" viewBox="0 0 24 24">
                <path fill="#0078D4" d="M8 12C8 8.7 10.7 6 14 6s6 2.7 6 6v2h2c1.7 0 3 1.3 3 3s-1.3 3-3 3H6c-1.7 0-3-1.3-3-3s1.3-3 3-3h2v-2z"/>
            </svg>`,
            github: `<svg width="48" height="48" viewBox="0 0 24 24">
                <path fill="#24292e" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.43 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.24-.01-2.24-3.02.66-3.8-.73-4.04-1.41-.13-.34-.72-1.41-1.23-1.69-.42-.23-1.02-.8-.02-.81.95-.01 1.62.87 1.85 1.23 1.08 1.82 2.81 1.31 3.5.99.11-.78.42-1.31.77-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.54-1.53.12-3.18 0 0 1-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.3-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.76.84 1.23 1.9 1.23 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.7.82.58A12.013 12.013 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>`
        };
        return icons[providerId] || '';
    }

    async startAuthentication() {
        if (!this.currentProvider) return;

        const authStatus = document.getElementById('auth-status');
        const authStatusText = document.getElementById('auth-status-text');
        const authActions = document.querySelector('.auth-actions');

        // Show loading state
        authStatus.classList.remove('hidden');
        authActions.style.display = 'none';
        authStatusText.textContent = 'Connecting to ' + this.providers[this.currentProvider].name + '...';

        try {
            // Simulate authentication process
            await this.simulateAuth(this.currentProvider);
            
            // Mark as connected
            this.providers[this.currentProvider].connected = true;
            this.providers[this.currentProvider].token = 'mock_token_' + Date.now();
            
            // Save connection
            this.saveConnections();
            
            // Update UI
            this.updateConnectionStatus();
            authStatusText.textContent = 'Successfully connected!';
            
            // Close modal after success
            setTimeout(() => {
                this.hideAuthModal();
                this.refreshCloudFiles();
            }, 1500);
            
        } catch (error) {
            authStatusText.textContent = 'Connection failed: ' + error.message;
            authActions.style.display = 'flex';
        }
    }

    async simulateAuth(provider) {
        // Simulate different authentication flows
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate for demo
                    resolve({ access_token: 'mock_token', refresh_token: 'mock_refresh' });
                } else {
                    reject(new Error('Authentication failed'));
                }
            }, 2000);
        });
    }

    async refreshCloudFiles() {
        if (!this.currentProvider || !this.providers[this.currentProvider].connected) {
            this.showCloudEmptyState('Connect to a cloud provider to browse files');
            return;
        }

        const cloudFiles = document.getElementById('cloud-files');
        cloudFiles.innerHTML = '<div class="cloud-loading">Loading files...</div>';

        try {
            // Simulate fetching files
            const files = await this.fetchCloudFiles(this.currentProvider);
            this.displayCloudFiles(files);
        } catch (error) {
            this.showCloudEmptyState('Failed to load files: ' + error.message);
        }
    }

    async fetchCloudFiles(provider) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockFiles = [
                    { name: 'Python Projects', type: 'folder', size: null, modified: '2024-01-15' },
                    { name: 'data_analysis.py', type: 'file', size: '2.5 KB', modified: '2024-01-14' },
                    { name: 'web_scraper.py', type: 'file', size: '1.8 KB', modified: '2024-01-13' },
                    { name: 'requirements.txt', type: 'file', size: '156 B', modified: '2024-01-12' },
                    { name: 'README.md', type: 'file', size: '890 B', modified: '2024-01-11' }
                ];
                resolve(mockFiles);
            }, 1000);
        });
    }

    displayCloudFiles(files) {
        const cloudFiles = document.getElementById('cloud-files');
        
        if (files.length === 0) {
            this.showCloudEmptyState('No files found');
            return;
        }

        cloudFiles.innerHTML = files.map(file => `
            <div class="cloud-file-item" data-file="${file.name}" data-type="${file.type}">
                <div class="cloud-file-icon">
                    ${file.type === 'folder' ? '📁' : this.getFileIcon(file.name)}
                </div>
                <div class="cloud-file-name">${file.name}</div>
                <div class="cloud-file-size">${file.size || ''}</div>
            </div>
        `).join('');

        // Add click handlers
        cloudFiles.querySelectorAll('.cloud-file-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectCloudFile(item);
            });
            
            item.addEventListener('dblclick', () => {
                this.openCloudFile(item.dataset.file, item.dataset.type);
            });
        });
    }

    showCloudEmptyState(message) {
        const cloudFiles = document.getElementById('cloud-files');
        cloudFiles.innerHTML = `
            <div class="cloud-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                <p>${message}</p>
            </div>
        `;
    }

    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const icons = {
            'py': '🐍',
            'js': '📜',
            'html': '🌐',
            'css': '🎨',
            'json': '📋',
            'md': '📝',
            'txt': '📄',
            'csv': '📊',
            'xlsx': '📈'
        };
        return icons[ext] || '📄';
    }

    selectCloudFile(item) {
        // Clear previous selections
        document.querySelectorAll('.cloud-file-item').forEach(file => {
            file.classList.remove('selected');
        });
        
        // Select current item
        item.classList.add('selected');
    }

    async openCloudFile(fileName, fileType) {
        if (fileType === 'folder') {
            // Navigate to folder (simulate)
            console.log('Opening folder:', fileName);
            return;
        }

        if (!fileName.endsWith('.py')) {
            this.showNotification('Only Python files can be opened in the editor', 'warning');
            return;
        }

        try {
            // Simulate downloading file content
            const content = await this.downloadCloudFile(fileName);
            
            // Create or open file in local editor
            window.fileManager.createFile(fileName, content);
            
            this.showNotification(`Opened ${fileName} from cloud`, 'success');
        } catch (error) {
            this.showNotification(`Failed to open ${fileName}: ${error.message}`, 'error');
        }
    }

    async downloadCloudFile(fileName) {
        // Simulate downloading file
        return new Promise((resolve) => {
            setTimeout(() => {
                const sampleContent = {
                    'data_analysis.py': '# Data Analysis Script\nimport pandas as pd\nimport numpy as np\n\nprint("Hello from cloud!")',
                    'web_scraper.py': '# Web Scraper\nimport requests\nfrom bs4 import BeautifulSoup\n\nprint("Scraper ready!")'
                };
                resolve(sampleContent[fileName] || `# ${fileName}\n\nprint("Cloud file content")`);
            }, 500);
        });
    }

    useTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template) return;

        template.files.forEach(file => {
            const uniqueName = window.fileManager.generateUniqueFileName(file.name);
            window.fileManager.createFile(uniqueName, file.content);
        });

        this.hideModal('templates-modal');
        this.showNotification(`Created project from ${template.name} template`, 'success');
    }

    async performAutoSync() {
        if (this.syncStatus === 'syncing') return;
        
        this.syncStatus = 'syncing';
        this.updateSyncStatus();

        try {
            // Simulate sync operation
            await this.syncFiles();
            this.syncStatus = 'idle';
            this.updateSyncStatus('All files synced');
        } catch (error) {
            this.syncStatus = 'error';
            this.updateSyncStatus('Sync failed');
        }
    }

    async syncFiles() {
        return new Promise((resolve) => {
            setTimeout(resolve, 2000); // Simulate sync delay
        });
    }

    updateSyncStatus(message = null) {
        const syncIcon = document.getElementById('sync-icon');
        const syncText = document.getElementById('sync-text');
        
        if (syncIcon) {
            syncIcon.classList.toggle('syncing', this.syncStatus === 'syncing');
        }
        
        if (syncText && message) {
            syncText.textContent = message;
        }
    }

    switchImportExportTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.import-export-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.import-export-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });
    }

    async importSelectedFiles() {
        const selectedFiles = document.querySelectorAll('.import-file-item input:checked');
        if (selectedFiles.length === 0) {
            this.showNotification('No files selected for import', 'warning');
            return;
        }

        for (const checkbox of selectedFiles) {
            const fileName = checkbox.dataset.file;
            try {
                const content = await this.downloadCloudFile(fileName);
                window.fileManager.createFile(fileName, content);
            } catch (error) {
                console.error('Failed to import', fileName, error);
            }
        }

        this.hideModal('cloud-import-export-modal');
        this.showNotification(`Imported ${selectedFiles.length} files`, 'success');
    }

    async exportFiles() {
        const exportAll = document.getElementById('export-all').checked;
        const exportPath = document.getElementById('export-path').value || '/Python IDE Export';

        const filesToExport = exportAll ? 
            window.fileManager.getAllFiles() : 
            [window.fileManager.getCurrentFile()].filter(Boolean);

        if (filesToExport.length === 0) {
            this.showNotification('No files to export', 'warning');
            return;
        }

        try {
            // Simulate upload process
            await this.uploadFilesToCloud(filesToExport, exportPath);
            
            this.hideModal('cloud-import-export-modal');
            this.showNotification(`Exported ${filesToExport.length} files to cloud`, 'success');
        } catch (error) {
            this.showNotification('Export failed: ' + error.message, 'error');
        }
    }

    async uploadFilesToCloud(files, path) {
        return new Promise((resolve) => {
            setTimeout(resolve, 1500); // Simulate upload
        });
    }

    createCloudFolder() {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        // Simulate folder creation
        this.showNotification(`Created folder: ${folderName}`, 'success');
        setTimeout(() => this.refreshCloudFiles(), 500);
    }

    saveConnections() {
        const connections = {};
        Object.keys(this.providers).forEach(key => {
            connections[key] = {
                connected: this.providers[key].connected,
                token: this.providers[key].token
            };
        });
        
        // Store in memory (localStorage not available)
        window.ideStorage = window.ideStorage || {};
        window.ideStorage['cloud-connections'] = connections;
    }

    loadStoredConnections() {
        try {
            const stored = window.ideStorage?.['cloud-connections'];
            if (stored) {
                Object.keys(stored).forEach(key => {
                    if (this.providers[key] && stored[key].connected) {
                        this.providers[key].connected = stored[key].connected;
                        this.providers[key].token = stored[key].token;
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load stored connections:', error);
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        if (window.pythonIDE) {
            window.pythonIDE.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Public API methods
    isConnected(provider = null) {
        const providerId = provider || this.currentProvider;
        return providerId && this.providers[providerId].connected;
    }

    getCurrentProvider() {
        return this.currentProvider;
    }

    getConnectedProviders() {
        return Object.keys(this.providers).filter(key => this.providers[key].connected);
    }

    async syncFile(fileName, content) {
        if (!this.isConnected()) {
            throw new Error('No cloud provider connected');
        }

        // Simulate file sync
        return new Promise((resolve) => {
            setTimeout(() => {
                this.showNotification(`Synced ${fileName} to cloud`, 'success');
                resolve(true);
            }, 1000);
        });
    }
}

// Create global instance
window.cloudManager = new CloudManager();