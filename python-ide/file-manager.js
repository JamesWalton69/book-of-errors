class FileManager {
    constructor() {
        this.files = new Map();
        this.currentFile = null;
        this.fileCounter = 0;
        this.storageKey = 'python-ide-files';
        
        // Initialize with sample files
        this.initializeDefaultFiles();
        this.loadFilesFromStorage();
        this.setupEventListeners();
    }

    initializeDefaultFiles() {
        const defaultFiles = [
            {
                name: 'main.py',
                content: `# Welcome to Python Browser IDE!
# This IDE runs Python directly in your browser using Pyodide

import sys
print(f"Python version: {sys.version}")

# Try some basic operations
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Squares: {squares}")

# You can install packages too!
# import micropip
# await micropip.install("numpy")
# import numpy as np
# print(f"NumPy version: {np.__version__}")

print("Happy coding! 🐍")`
            },
            {
                name: 'data_analysis.py',
                content: `# Data Analysis Example
# Run this after installing numpy and pandas

# import micropip
# await micropip.install("numpy")
# await micropip.install("pandas")

# import numpy as np
# import pandas as pd

# Sample data
data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
    'age': [25, 30, 35, 28],
    'city': ['New York', 'London', 'Tokyo', 'Paris']
}

print("Sample data:", data)
# df = pd.DataFrame(data)
# print(df)`
            },
            {
                name: 'math_examples.py',
                content: `# Mathematical computations in Python
import math

# Basic math operations
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calculate fibonacci sequence
fib_sequence = [fibonacci(i) for i in range(10)]
print(f"Fibonacci sequence: {fib_sequence}")

# Trigonometric functions
angle = math.pi / 4
print(f"sin(π/4) = {math.sin(angle):.4f}")
print(f"cos(π/4) = {math.cos(angle):.4f}")

# Factorial
print(f"10! = {math.factorial(10)}")`
            }
        ];

        defaultFiles.forEach(file => {
            if (!this.files.has(file.name)) {
                this.files.set(file.name, {
                    id: this.generateFileId(),
                    name: file.name,
                    content: file.content,
                    modified: false,
                    created: new Date().toISOString()
                });
            }
        });
    }

    setupEventListeners() {
        // New file button
        document.getElementById('new-file-btn')?.addEventListener('click', () => {
            this.createNewFile();
        });

        // Save button
        document.getElementById('save-btn')?.addEventListener('click', () => {
            this.saveCurrentFile();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    this.saveCurrentFile();
                } else if (e.key === 'n') {
                    e.preventDefault();
                    this.createNewFile();
                }
            }
        });
    }

    generateFileId() {
        return `file_${++this.fileCounter}_${Date.now()}`;
    }

    createNewFile() {
        const name = this.generateUniqueFileName('untitled.py');
        this.createFile(name);
    }

    createFile(name, content = '# New Python file\n\nprint("Hello, World!")') {
        if (this.files.has(name)) {
            this.openFile(name);
            return;
        }

        const file = {
            id: this.generateFileId(),
            name: name,
            content: content,
            modified: false,
            created: new Date().toISOString()
        };

        this.files.set(name, file);
        this.saveToStorage();
        this.updateFileExplorer();
        this.openFile(name);
        
        // Focus on the new file name for renaming
        setTimeout(() => {
            const fileItem = document.querySelector(`[data-file="${name}"]`);
            if (fileItem) {
                this.startRename(fileItem, name);
            }
        }, 100);
    }

    generateUniqueFileName(baseName) {
        let counter = 1;
        let name = baseName;
        
        while (this.files.has(name)) {
            const ext = baseName.split('.').pop();
            const nameWithoutExt = baseName.replace(`.${ext}`, '');
            name = `${nameWithoutExt}${counter}.${ext}`;
            counter++;
        }
        
        return name;
    }

    openFile(fileName) {
        if (!this.files.has(fileName)) return;

        const file = this.files.get(fileName);
        this.currentFile = fileName;
        
        // Update editor content through editor manager
        if (window.editorManager) {
            window.editorManager.openFile(file);
        }
        
        this.updateFileExplorer();
        this.updateTabBar();
    }

    saveFile(fileName, content) {
        if (!this.files.has(fileName)) return;

        const file = this.files.get(fileName);
        const hasChanges = file.content !== content;
        
        file.content = content;
        file.modified = false;
        file.lastModified = new Date().toISOString();
        
        if (hasChanges) {
            this.saveToStorage();
        }
        
        this.updateFileExplorer();
        this.updateTabBar();
        
        // Show save confirmation
        this.showSaveConfirmation(fileName);
    }

    saveCurrentFile() {
        if (!this.currentFile || !window.editorManager) return;
        
        const content = window.editorManager.getContent();
        this.saveFile(this.currentFile, content);
    }

    deleteFile(fileName) {
        if (!this.files.has(fileName)) return;
        
        if (confirm(`Are you sure you want to delete ${fileName}?`)) {
            this.files.delete(fileName);
            
            if (this.currentFile === fileName) {
                // Open another file or show welcome screen
                const remainingFiles = Array.from(this.files.keys());
                if (remainingFiles.length > 0) {
                    this.openFile(remainingFiles[0]);
                } else {
                    this.currentFile = null;
                    if (window.editorManager) {
                        window.editorManager.showWelcomeScreen();
                    }
                }
            }
            
            this.saveToStorage();
            this.updateFileExplorer();
            this.updateTabBar();
        }
    }

    renameFile(oldName, newName) {
        if (!this.files.has(oldName) || this.files.has(newName)) return false;
        
        const file = this.files.get(oldName);
        file.name = newName;
        
        this.files.delete(oldName);
        this.files.set(newName, file);
        
        if (this.currentFile === oldName) {
            this.currentFile = newName;
        }
        
        this.saveToStorage();
        this.updateFileExplorer();
        this.updateTabBar();
        
        return true;
    }

    getFile(fileName) {
        return this.files.get(fileName);
    }

    getAllFiles() {
        return Array.from(this.files.values());
    }

    getCurrentFile() {
        return this.currentFile ? this.files.get(this.currentFile) : null;
    }

    updateFileExplorer() {
        const explorer = document.getElementById('file-explorer');
        if (!explorer) return;

        const files = Array.from(this.files.values()).sort((a, b) => a.name.localeCompare(b.name));
        
        explorer.innerHTML = files.map(file => `
            <div class="file-item ${file.name === this.currentFile ? 'active' : ''}" 
                 data-file="${file.name}" 
                 onclick="window.fileManager.openFile('${file.name}')">
                <div class="file-icon">🐍</div>
                <span class="file-name">${file.name}</span>
                <div class="file-actions">
                    <button class="file-action-btn" onclick="event.stopPropagation(); window.fileManager.startRename(this.closest('.file-item'), '${file.name}')" title="Rename">
                        ✏️
                    </button>
                    <button class="file-action-btn" onclick="event.stopPropagation(); window.fileManager.deleteFile('${file.name}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
        
        // Show/hide welcome message
        const noFilesMessage = document.getElementById('no-files-message');
        if (files.length === 0) {
            noFilesMessage?.classList.remove('hidden');
        } else {
            noFilesMessage?.classList.add('hidden');
        }
    }

    updateTabBar() {
        const tabBar = document.getElementById('tab-bar');
        if (!tabBar) return;

        const files = Array.from(this.files.values());
        
        tabBar.innerHTML = files.map(file => `
            <div class="tab ${file.name === this.currentFile ? 'active' : ''}" 
                 data-file="${file.name}" 
                 onclick="window.fileManager.openFile('${file.name}')">
                <span class="tab-name">${file.name}${file.modified ? ' •' : ''}</span>
                <button class="tab-close" onclick="event.stopPropagation(); window.fileManager.deleteFile('${file.name}')">
                    ×
                </button>
            </div>
        `).join('');
    }

    startRename(fileItem, fileName) {
        const nameSpan = fileItem.querySelector('.file-name');
        const currentName = fileName;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'rename-input';
        input.style.cssText = `
            background: var(--ide-bg-primary);
            border: 1px solid var(--ide-accent);
            color: var(--color-text);
            padding: 2px 4px;
            border-radius: 3px;
            font-size: inherit;
            width: 100%;
        `;
        
        nameSpan.replaceWith(input);
        input.focus();
        input.select();
        
        const finishRename = () => {
            const newName = input.value.trim();
            const newNameSpan = document.createElement('span');
            newNameSpan.className = 'file-name';
            
            if (newName && newName !== currentName && !this.files.has(newName)) {
                if (this.renameFile(currentName, newName)) {
                    newNameSpan.textContent = newName;
                } else {
                    newNameSpan.textContent = currentName;
                }
            } else {
                newNameSpan.textContent = currentName;
            }
            
            input.replaceWith(newNameSpan);
        };
        
        input.addEventListener('blur', finishRename);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishRename();
            } else if (e.key === 'Escape') {
                input.value = currentName;
                finishRename();
            }
        });
    }

    showSaveConfirmation(fileName) {
        const statusText = document.getElementById('status-text');
        if (statusText) {
            const originalText = statusText.textContent;
            statusText.textContent = `Saved ${fileName}`;
            statusText.style.color = 'var(--ide-success)';
            
            setTimeout(() => {
                statusText.textContent = originalText;
                statusText.style.color = '';
            }, 2000);
        }
    }

    saveToStorage() {
        try {
            const data = {
                files: Array.from(this.files.entries()),
                currentFile: this.currentFile,
                timestamp: new Date().toISOString()
            };
            
            // Use a simple variable storage since localStorage is not available
            window.ideStorage = window.ideStorage || {};
            window.ideStorage[this.storageKey] = data;
        } catch (error) {
            console.warn('Failed to save files to storage:', error);
        }
    }

    loadFilesFromStorage() {
        try {
            if (!window.ideStorage || !window.ideStorage[this.storageKey]) {
                return;
            }
            
            const data = window.ideStorage[this.storageKey];
            
            if (data.files) {
                this.files = new Map(data.files);
                this.currentFile = data.currentFile;
                
                // Update file counter to avoid ID conflicts
                this.fileCounter = Math.max(...Array.from(this.files.values())
                    .map(f => parseInt(f.id.split('_')[1]) || 0)) + 1;
            }
        } catch (error) {
            console.warn('Failed to load files from storage:', error);
        }
    }

    exportFiles() {
        const data = {
            files: this.getAllFiles(),
            exported: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'python-ide-project.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    importFiles(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.files && Array.isArray(data.files)) {
                    data.files.forEach(file => {
                        if (file.name && file.content) {
                            const uniqueName = this.generateUniqueFileName(file.name);
                            this.createFile(uniqueName, file.content);
                        }
                    });
                    
                    this.updateFileExplorer();
                    alert(`Imported ${data.files.length} files successfully!`);
                }
            } catch (error) {
                alert('Failed to import files. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    }
}

// Create global instance
window.fileManager = new FileManager();