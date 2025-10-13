class CloudSyncManager {
    constructor() {
        this.syncQueue = new Map();
        this.syncHistory = [];
        this.isOnline = navigator.onLine;
        this.syncInterval = null;
        this.conflictResolver = new ConflictResolver();
        this.offlineStorage = new Map();
        
        this.setupEventListeners();
        this.startSyncProcess();
    }

    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });

        // File change detection
        if (window.fileManager) {
            // Override file save method to trigger sync
            const originalSaveFile = window.fileManager.saveFile;
            window.fileManager.saveFile = (fileName, content) => {
                const result = originalSaveFile.call(window.fileManager, fileName, content);
                this.queueFileForSync(fileName, content);
                return result;
            };
        }

        // Visibility change (for background sync)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForCloudUpdates();
            }
        });
    }

    startSyncProcess() {
        // Start periodic sync
        this.syncInterval = setInterval(() => {
            if (this.isOnline && window.cloudManager?.isConnected()) {
                this.performPeriodicSync();
            }
        }, 30000); // Sync every 30 seconds
    }

    stopSyncProcess() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    queueFileForSync(fileName, content, operation = 'update') {
        const syncItem = {
            fileName,
            content,
            operation, // 'create', 'update', 'delete'
            timestamp: Date.now(),
            attempts: 0,
            lastError: null
        };

        this.syncQueue.set(fileName, syncItem);
        
        // Store offline for later sync
        this.offlineStorage.set(fileName, {
            content,
            timestamp: Date.now(),
            synced: false
        });

        // Try immediate sync if online
        if (this.isOnline && window.cloudManager?.isConnected()) {
            this.syncFile(fileName);
        }

        this.updateSyncStatus();
    }

    async syncFile(fileName) {
        const syncItem = this.syncQueue.get(fileName);
        if (!syncItem) return;

        try {
            syncItem.attempts++;
            
            const provider = window.cloudManager.getCurrentProvider();
            if (!provider || !window.cloudManager.isConnected(provider)) {
                throw new Error('No cloud provider connected');
            }

            // Perform sync operation based on type
            let success = false;
            switch (syncItem.operation) {
                case 'create':
                case 'update':
                    success = await this.uploadFile(fileName, syncItem.content);
                    break;
                case 'delete':
                    success = await this.deleteCloudFile(fileName);
                    break;
            }

            if (success) {
                // Remove from sync queue
                this.syncQueue.delete(fileName);
                
                // Mark as synced in offline storage
                if (this.offlineStorage.has(fileName)) {
                    const item = this.offlineStorage.get(fileName);
                    item.synced = true;
                    this.offlineStorage.set(fileName, item);
                }
                
                // Add to sync history
                this.syncHistory.push({
                    fileName,
                    operation: syncItem.operation,
                    timestamp: Date.now(),
                    success: true
                });
                
                this.showSyncNotification(`Synced ${fileName} to cloud`, 'success');
            }
            
        } catch (error) {
            console.error('Sync failed for', fileName, error);
            syncItem.lastError = error.message;
            
            // Retry logic
            if (syncItem.attempts >= 3) {
                // Move to failed items
                this.syncHistory.push({
                    fileName,
                    operation: syncItem.operation,
                    timestamp: Date.now(),
                    success: false,
                    error: error.message
                });
                
                this.syncQueue.delete(fileName);
                this.showSyncNotification(`Failed to sync ${fileName}: ${error.message}`, 'error');
            }
        }

        this.updateSyncStatus();
    }

    async uploadFile(fileName, content) {
        // Check for conflicts first
        const cloudVersion = await this.getCloudFileVersion(fileName);
        const localVersion = this.getLocalFileVersion(fileName);
        
        if (cloudVersion && localVersion && cloudVersion.timestamp > localVersion.timestamp) {
            // Conflict detected
            const resolution = await this.conflictResolver.resolve(fileName, localVersion, cloudVersion);
            if (!resolution) {
                return false; // User cancelled
            }
            content = resolution.content;
        }

        // Simulate upload to current provider
        return await this.performCloudUpload(fileName, content);
    }

    async performCloudUpload(fileName, content) {
        // Simulate cloud upload based on current provider
        const provider = window.cloudManager.getCurrentProvider();
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.05) { // 95% success rate
                    resolve(true);
                } else {
                    reject(new Error('Network error'));
                }
            }, 1000 + Math.random() * 2000); // 1-3 second delay
        });
    }

    async deleteCloudFile(fileName) {
        // Simulate file deletion
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), 500);
        });
    }

    async getCloudFileVersion(fileName) {
        // Simulate getting cloud file metadata
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    fileName,
                    timestamp: Date.now() - Math.random() * 3600000, // Random time in last hour
                    size: Math.floor(Math.random() * 10000),
                    hash: 'mock_hash_' + Math.random().toString(36)
                });
            }, 300);
        });
    }

    getLocalFileVersion(fileName) {
        const file = window.fileManager?.getFile(fileName);
        if (!file) return null;
        
        return {
            fileName,
            timestamp: new Date(file.lastModified || file.created).getTime(),
            content: file.content,
            hash: this.hashString(file.content)
        };
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.size === 0) return;

        // Process up to 3 files concurrently
        const filesToSync = Array.from(this.syncQueue.keys()).slice(0, 3);
        
        await Promise.allSettled(
            filesToSync.map(fileName => this.syncFile(fileName))
        );
    }

    async performPeriodicSync() {
        try {
            // Check for cloud updates
            await this.checkForCloudUpdates();
            
            // Process pending syncs
            await this.processSyncQueue();
            
            // Clean up old history
            this.cleanupSyncHistory();
            
        } catch (error) {
            console.error('Periodic sync failed:', error);
        }
    }

    async checkForCloudUpdates() {
        if (!window.cloudManager?.isConnected()) return;

        try {
            // Get list of cloud files
            const cloudFiles = await this.getCloudFileList();
            const localFiles = window.fileManager.getAllFiles();
            
            // Check for updates
            for (const cloudFile of cloudFiles) {
                const localFile = localFiles.find(f => f.name === cloudFile.name);
                
                if (!localFile) {
                    // New file in cloud
                    this.showSyncNotification(`New file available in cloud: ${cloudFile.name}`, 'info');
                } else {
                    const localTimestamp = new Date(localFile.lastModified || localFile.created).getTime();
                    if (cloudFile.timestamp > localTimestamp) {
                        // Cloud file is newer
                        this.showSyncNotification(`${cloudFile.name} updated in cloud`, 'info');
                    }
                }
            }
            
        } catch (error) {
            console.error('Failed to check for cloud updates:', error);
        }
    }

    async getCloudFileList() {
        // Simulate getting cloud file list
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { name: 'main.py', timestamp: Date.now() - 3600000, size: 1500 },
                    { name: 'utils.py', timestamp: Date.now() - 7200000, size: 800 }
                ]);
            }, 1000);
        });
    }

    handleOnlineStatus() {
        this.updateSyncStatus();
        this.showSyncNotification('Back online - resuming sync', 'success');
    }

    handleOfflineStatus() {
        this.updateSyncStatus();
        this.showSyncNotification('Offline mode - changes will sync when online', 'warning');
    }

    updateSyncStatus() {
        const syncIcon = document.getElementById('sync-icon');
        const syncText = document.getElementById('sync-text');
        const cloudPanel = document.getElementById('cloud-panel');
        
        if (!syncIcon || !syncText) return;

        if (!this.isOnline) {
            syncIcon.classList.remove('syncing');
            syncText.textContent = 'Offline';
            cloudPanel?.classList.add('cloud-offline');
            return;
        }

        cloudPanel?.classList.remove('cloud-offline');
        
        if (!window.cloudManager?.isConnected()) {
            syncIcon.classList.remove('syncing');
            syncText.textContent = 'Not connected';
            return;
        }

        if (this.syncQueue.size > 0) {
            syncIcon.classList.add('syncing');
            syncText.textContent = `Syncing ${this.syncQueue.size} file(s)...`;
        } else {
            syncIcon.classList.remove('syncing');
            syncText.textContent = 'All files synced';
        }
    }

    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            isConnected: window.cloudManager?.isConnected() || false,
            queueSize: this.syncQueue.size,
            lastSync: this.getLastSyncTime(),
            pendingFiles: Array.from(this.syncQueue.keys()),
            offlineFiles: Array.from(this.offlineStorage.entries())
                .filter(([_, data]) => !data.synced)
                .map(([fileName, _]) => fileName)
        };
    }

    getLastSyncTime() {
        const successfulSyncs = this.syncHistory.filter(item => item.success);
        if (successfulSyncs.length === 0) return null;
        
        return Math.max(...successfulSyncs.map(item => item.timestamp));
    }

    cleanupSyncHistory() {
        // Keep only last 100 entries
        if (this.syncHistory.length > 100) {
            this.syncHistory = this.syncHistory.slice(-100);
        }
        
        // Clean up old offline storage (older than 7 days)
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        for (const [fileName, data] of this.offlineStorage.entries()) {
            if (data.synced && data.timestamp < weekAgo) {
                this.offlineStorage.delete(fileName);
            }
        }
    }

    showSyncNotification(message, type = 'info') {
        if (window.pythonIDE) {
            window.pythonIDE.showNotification(message, type);
        }
    }

    // Force sync specific file
    forceSyncFile(fileName) {
        const file = window.fileManager?.getFile(fileName);
        if (file) {
            this.queueFileForSync(fileName, file.content, 'update');
            this.syncFile(fileName);
        }
    }

    // Force sync all files
    forceSyncAll() {
        const files = window.fileManager?.getAllFiles() || [];
        files.forEach(file => {
            this.queueFileForSync(file.name, file.content, 'update');
        });
        this.processSyncQueue();
    }

    // Get sync statistics
    getSyncStats() {
        const totalSyncs = this.syncHistory.length;
        const successfulSyncs = this.syncHistory.filter(item => item.success).length;
        const failedSyncs = totalSyncs - successfulSyncs;
        
        return {
            total: totalSyncs,
            successful: successfulSyncs,
            failed: failedSyncs,
            successRate: totalSyncs > 0 ? (successfulSyncs / totalSyncs * 100).toFixed(1) : '0',
            pendingQueue: this.syncQueue.size,
            offlineChanges: Array.from(this.offlineStorage.values())
                .filter(item => !item.synced).length
        };
    }

    destroy() {
        this.stopSyncProcess();
        this.syncQueue.clear();
        this.offlineStorage.clear();
        this.syncHistory = [];
    }
}

class ConflictResolver {
    constructor() {
        this.resolutionStrategies = {
            'local': 'Use local version',
            'cloud': 'Use cloud version', 
            'merge': 'Merge changes',
            'rename': 'Keep both versions'
        };
    }

    async resolve(fileName, localVersion, cloudVersion) {
        return new Promise((resolve) => {
            // Create conflict resolution modal
            const modal = this.createConflictModal(fileName, localVersion, cloudVersion);
            document.body.appendChild(modal);
            modal.classList.remove('hidden');
            
            // Handle resolution choice
            modal.addEventListener('click', (e) => {
                const strategy = e.target.dataset.strategy;
                if (strategy) {
                    const result = this.applyResolutionStrategy(strategy, fileName, localVersion, cloudVersion);
                    modal.remove();
                    resolve(result);
                }
            });
        });
    }

    createConflictModal(fileName, localVersion, cloudVersion) {
        const modal = document.createElement('div');
        modal.className = 'modal conflict-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Sync Conflict: ${fileName}</h3>
                </div>
                <div class="modal-body">
                    <p>This file has been modified both locally and in the cloud. Choose how to resolve:</p>
                    
                    <div class="conflict-versions">
                        <div class="version-info">
                            <h4>Local Version</h4>
                            <p>Modified: ${new Date(localVersion.timestamp).toLocaleString()}</p>
                            <textarea readonly class="version-preview">${localVersion.content.substring(0, 200)}...</textarea>
                        </div>
                        <div class="version-info">
                            <h4>Cloud Version</h4>
                            <p>Modified: ${new Date(cloudVersion.timestamp).toLocaleString()}</p>
                            <textarea readonly class="version-preview">${cloudVersion.content?.substring(0, 200) || 'Content not available'}...</textarea>
                        </div>
                    </div>
                    
                    <div class="resolution-options">
                        <button class="btn btn--primary" data-strategy="local">Use Local Version</button>
                        <button class="btn btn--primary" data-strategy="cloud">Use Cloud Version</button>
                        <button class="btn btn--secondary" data-strategy="rename">Keep Both</button>
                        <button class="btn btn--secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    applyResolutionStrategy(strategy, fileName, localVersion, cloudVersion) {
        switch (strategy) {
            case 'local':
                return { content: localVersion.content, action: 'upload' };
            case 'cloud':
                return { content: cloudVersion.content, action: 'download' };
            case 'rename':
                // Create backup of local version
                const backupName = this.generateBackupName(fileName);
                window.fileManager?.createFile(backupName, localVersion.content);
                return { content: cloudVersion.content, action: 'download' };
            default:
                return null;
        }
    }

    generateBackupName(fileName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const parts = fileName.split('.');
        if (parts.length > 1) {
            const ext = parts.pop();
            const name = parts.join('.');
            return `${name}_backup_${timestamp}.${ext}`;
        }
        return `${fileName}_backup_${timestamp}`;
    }
}

// Create global instance
window.cloudSyncManager = new CloudSyncManager();