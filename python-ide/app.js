class PythonIDE {
    constructor() {
        this.isInitialized = false;
        this.sidebarCollapsed = false;
        this.consoleHeight = 200;
        this.isResizing = false;
        
        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize all managers
            await this.initializeManagers();
            
            // Setup UI event listeners
            this.setupUIEventListeners();
            
            // Setup console
            this.setupConsole();
            
            // Setup modals
            this.setupModals();
            
            // Setup resize functionality
            this.setupResizing();
            
            // Initialize Pyodide
            await window.pyodideManager.initialize();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to initialize IDE:', error);
            this.showError('Failed to initialize IDE. Please refresh the page.');
        }
    }

    async initializeManagers() {
        // Initialize editor manager
        await window.editorManager.initialize();
        
        // Open first file if available
        const files = window.fileManager.getAllFiles();
        if (files.length > 0) {
            window.fileManager.openFile(files[0].name);
            window.editorManager.hideWelcomeScreen();
        } else {
            window.editorManager.showWelcomeScreen();
        }
        
        // Update UI
        window.fileManager.updateFileExplorer();
        window.fileManager.updateTabBar();
    }

    setupUIEventListeners() {
        // Toolbar buttons
        document.getElementById('run-btn')?.addEventListener('click', () => {
            window.editorManager.runCurrentFile();
        });

        document.getElementById('stop-btn')?.addEventListener('click', () => {
            window.pyodideManager.stopExecution();
        });

        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showModal('settings-modal');
        });

        document.getElementById('packages-btn')?.addEventListener('click', () => {
            this.showModal('packages-modal');
            this.updatePackagesList();
        });

        // Sidebar toggle
        document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Console actions
        document.getElementById('clear-console')?.addEventListener('click', () => {
            window.editorManager.clearConsole();
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }

    setupConsole() {
        // Console tab switching
        document.querySelectorAll('.console-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                window.editorManager.switchConsoleTab(tabName);
            });
        });

        // Terminal input
        const terminalInput = document.getElementById('terminal-input');
        if (terminalInput) {
            terminalInput.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    const code = terminalInput.value.trim();
                    if (code) {
                        await this.executeTerminalCommand(code);
                        terminalInput.value = '';
                    }
                }
            });
        }
    }

    async executeTerminalCommand(code) {
        const terminalOutput = document.getElementById('terminal-output');
        if (!terminalOutput || !window.pyodideManager) return;

        // Add input line
        const inputLine = document.createElement('div');
        inputLine.className = 'terminal-line';
        inputLine.innerHTML = `
            <span class="terminal-prompt">>>> </span>
            <span class="terminal-text">${this.escapeHtml(code)}</span>
        `;
        terminalOutput.appendChild(inputLine);

        try {
            const result = await window.pyodideManager.runInteractiveCode(code);
            
            if (result.success) {
                if (result.result) {
                    const outputLine = document.createElement('div');
                    outputLine.className = 'terminal-line';
                    outputLine.innerHTML = `<span class="terminal-text">${this.escapeHtml(result.result)}</span>`;
                    terminalOutput.appendChild(outputLine);
                }
            } else {
                const errorLine = document.createElement('div');
                errorLine.className = 'terminal-line';
                errorLine.innerHTML = `<span class="terminal-text" style="color: var(--ide-error)">${this.escapeHtml(result.error)}</span>`;
                terminalOutput.appendChild(errorLine);
            }
        } catch (error) {
            const errorLine = document.createElement('div');
            errorLine.className = 'terminal-line';
            errorLine.innerHTML = `<span class="terminal-text" style="color: var(--ide-error)">Error: ${this.escapeHtml(error.message)}</span>`;
            terminalOutput.appendChild(errorLine);
        }

        // Scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    setupModals() {
        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Settings modal
        this.setupSettingsModal();
        
        // Packages modal
        this.setupPackagesModal();
    }

    setupSettingsModal() {
        // Theme selector
        document.getElementById('theme-select')?.addEventListener('change', (e) => {
            window.editorManager.setTheme(e.target.value);
        });

        // Font size slider
        const fontSizeSlider = document.getElementById('font-size-slider');
        const fontSizeValue = document.getElementById('font-size-value');
        
        fontSizeSlider?.addEventListener('input', (e) => {
            const size = e.target.value;
            fontSizeValue.textContent = `${size}px`;
            window.editorManager.setFontSize(size);
        });

        // Auto-save checkbox
        document.getElementById('auto-save-checkbox')?.addEventListener('change', (e) => {
            window.editorManager.setAutoSave(e.target.checked);
        });

        // Word wrap checkbox
        document.getElementById('word-wrap-checkbox')?.addEventListener('change', (e) => {
            window.editorManager.setWordWrap(e.target.checked);
        });
    }

    setupPackagesModal() {
        // Install package button
        document.getElementById('install-package')?.addEventListener('click', () => {
            const packageName = document.getElementById('package-name')?.value.trim();
            if (packageName) {
                this.installPackage(packageName);
            }
        });

        // Package name input - install on Enter
        document.getElementById('package-name')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const packageName = e.target.value.trim();
                if (packageName) {
                    this.installPackage(packageName);
                }
            }
        });

        // Popular package buttons
        document.querySelectorAll('.package-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const packageName = btn.dataset.package;
                if (packageName) {
                    this.installPackage(packageName);
                }
            });
        });
    }

    async installPackage(packageName) {
        if (!packageName || !window.pyodideManager) return;

        const installBtn = document.getElementById('install-package');
        const originalText = installBtn?.textContent;
        
        try {
            if (installBtn) {
                installBtn.textContent = 'Installing...';
                installBtn.disabled = true;
            }

            const result = await window.pyodideManager.installPackage(packageName);
            
            if (result.success) {
                this.showNotification(`Successfully installed ${packageName}`, 'success');
                this.updatePackagesList();
                
                // Clear input
                const packageInput = document.getElementById('package-name');
                if (packageInput) packageInput.value = '';
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification(`Failed to install ${packageName}: ${error.message}`, 'error');
        } finally {
            if (installBtn) {
                installBtn.textContent = originalText;
                installBtn.disabled = false;
            }
        }
    }

    updatePackagesList() {
        const packagesList = document.getElementById('installed-packages-list');
        if (!packagesList || !window.pyodideManager) return;

        const packages = window.pyodideManager.getInstalledPackages();
        
        packagesList.innerHTML = packages.map(pkg => 
            `<div class="package-item">${pkg}</div>`
        ).join('');
    }

    setupResizing() {
        const resizeHandle = document.getElementById('console-resize-handle');
        const consolePanel = document.getElementById('console-panel');
        
        if (!resizeHandle || !consolePanel) return;

        let startY = 0;
        let startHeight = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            startY = e.clientY;
            startHeight = parseInt(document.defaultView.getComputedStyle(consolePanel).height, 10);
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            e.preventDefault();
        });

        const handleMouseMove = (e) => {
            if (!this.isResizing) return;
            
            const deltaY = startY - e.clientY;
            const newHeight = Math.min(Math.max(100, startHeight + deltaY), window.innerHeight - 200);
            
            consolePanel.style.height = `${newHeight}px`;
            resizeHandle.style.bottom = `${newHeight}px`;
            
            this.consoleHeight = newHeight;
        };

        const handleMouseUp = () => {
            this.isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        this.sidebarCollapsed = !this.sidebarCollapsed;
        sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
        
        // Update toggle button icon
        const toggleBtn = document.getElementById('toggle-sidebar');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('svg path');
            if (icon) {
                icon.setAttribute('d', this.sidebarCollapsed ? 
                    'M10 3L6 8L10 13V3z' : 'M6 3L10 8L6 13V3z'
                );
            }
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            
            // Focus first input if available
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--ide-bg-secondary);
            color: var(--color-text);
            padding: 12px 16px;
            border-radius: var(--radius-base);
            border-left: 4px solid var(--ide-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'accent'});
            box-shadow: var(--shadow-md);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    handleGlobalKeyboard(e) {
        // Handle global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    window.editorManager.runCurrentFile();
                    break;
                case 'b':
                    e.preventDefault();
                    this.toggleSidebar();
                    break;
                case '`':
                    e.preventDefault();
                    window.editorManager.switchConsoleTab('terminal');
                    break;
            }
        }
        
        // ESC to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                this.hideModal(modal.id);
            });
        }
    }

    handleWindowResize() {
        // Adjust layout on window resize
        if (window.editorManager && window.editorManager.editor) {
            window.editorManager.editor.layout();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.rename-input {
    background: var(--ide-bg-primary) !important;
    border: 1px solid var(--ide-accent) !important;
    color: var(--color-text) !important;
    padding: 2px 4px !important;
    border-radius: 3px !important;
    font-size: inherit !important;
    width: 100% !important;
    outline: none !important;
}

.file-actions {
    display: none;
    gap: 4px;
}

.file-item:hover .file-actions {
    display: flex;
}

.file-action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    border-radius: 2px;
    font-size: 12px;
    opacity: 0.7;
    transition: all 0.15s;
}

.file-action-btn:hover {
    background: var(--ide-bg-tertiary);
    opacity: 1;
}
`;
document.head.appendChild(style);

// Initialize IDE when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pythonIDE = new PythonIDE();
    });
} else {
    window.pythonIDE = new PythonIDE();
}