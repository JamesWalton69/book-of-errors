class EditorManager {
    constructor() {
        this.editor = null;
        this.currentFile = null;
        this.theme = 'vs-dark';
        this.fontSize = 14;
        this.wordWrap = false;
        this.autoSave = true;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        return new Promise((resolve) => {
            // Configure Monaco loader
            require.config({ 
                paths: { 
                    'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' 
                },
                'vs/nls': {
                    availableLanguages: {
                        '*': 'en'
                    }
                }
            });

            require(['vs/editor/editor.main'], () => {
                this.createEditor();
                this.setupEventListeners();
                this.loadSettings();
                this.isInitialized = true;
                resolve();
            });
        });
    }

    createEditor() {
        const container = document.getElementById('editor-container');
        if (!container) return;

        // Create Monaco Editor
        this.editor = monaco.editor.create(container, {
            value: '',
            language: 'python',
            theme: this.theme,
            fontSize: this.fontSize,
            wordWrap: this.wordWrap ? 'on' : 'off',
            minimap: { enabled: true },
            lineNumbers: 'on',
            folding: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            bracketMatching: 'always',
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: true,
            parameterHints: { enabled: true },
            quickSuggestions: {
                other: true,
                comments: false,
                strings: false
            }
        });

        // Setup Python language features
        this.setupPythonLanguageFeatures();
    }

    setupPythonLanguageFeatures() {
        if (!monaco) return;

        // Python keywords and built-ins for better autocomplete
        const pythonKeywords = [
            'False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue',
            'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
            'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass',
            'raise', 'return', 'try', 'while', 'with', 'yield'
        ];

        const pythonBuiltins = [
            'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes',
            'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr',
            'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter',
            'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr',
            'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass',
            'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min',
            'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property',
            'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice',
            'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type',
            'vars', 'zip'
        ];

        // Register completion provider
        monaco.languages.registerCompletionItemProvider('python', {
            provideCompletionItems: (model, position) => {
                const suggestions = [];

                // Add keywords
                pythonKeywords.forEach(keyword => {
                    suggestions.push({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        documentation: `Python keyword: ${keyword}`
                    });
                });

                // Add built-ins
                pythonBuiltins.forEach(builtin => {
                    suggestions.push({
                        label: builtin,
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: builtin,
                        documentation: `Python built-in: ${builtin}`
                    });
                });

                // Add common imports
                const commonImports = [
                    'import sys', 'import os', 'import math', 'import random',
                    'import json', 'import datetime', 'import re', 'import time',
                    'import collections', 'from typing import',
                    'import numpy as np', 'import pandas as pd', 'import matplotlib.pyplot as plt'
                ];

                commonImports.forEach(imp => {
                    suggestions.push({
                        label: imp,
                        kind: monaco.languages.CompletionItemKind.Module,
                        insertText: imp,
                        documentation: `Import statement: ${imp}`
                    });
                });

                return { suggestions };
            }
        });
    }

    setupEventListeners() {
        if (!this.editor) return;

        // Auto-save on content change
        this.editor.onDidChangeModelContent(() => {
            if (this.autoSave && this.currentFile) {
                this.markFileAsModified();
                
                // Debounced auto-save
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    if (window.fileManager && this.currentFile) {
                        window.fileManager.saveFile(this.currentFile.name, this.getContent());
                    }
                }, 2000);
            }
        });

        // Keyboard shortcuts
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            this.runCurrentFile();
        });

        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
            this.toggleComment();
        });

        // Context menu
        this.editor.addAction({
            id: 'run-file',
            label: 'Run File',
            contextMenuGroupId: '1_modification',
            run: () => this.runCurrentFile()
        });

        this.editor.addAction({
            id: 'run-selection',
            label: 'Run Selection',
            contextMenuGroupId: '1_modification',
            run: () => this.runSelection()
        });
    }

    openFile(file) {
        if (!this.editor || !file) return;

        this.currentFile = file;
        this.editor.setValue(file.content);
        
        // Focus editor
        this.editor.focus();
        
        // Update cursor position in status
        this.updateCursorPosition();
    }

    getContent() {
        return this.editor ? this.editor.getValue() : '';
    }

    setContent(content) {
        if (this.editor) {
            this.editor.setValue(content);
        }
    }

    showWelcomeScreen() {
        const noFilesMessage = document.getElementById('no-files-message');
        const editorContainer = document.getElementById('editor-container');
        
        if (noFilesMessage && editorContainer) {
            noFilesMessage.classList.remove('hidden');
            editorContainer.style.display = 'none';
        }
        
        this.currentFile = null;
    }

    hideWelcomeScreen() {
        const noFilesMessage = document.getElementById('no-files-message');
        const editorContainer = document.getElementById('editor-container');
        
        if (noFilesMessage && editorContainer) {
            noFilesMessage.classList.add('hidden');
            editorContainer.style.display = 'block';
        }
    }

    async runCurrentFile() {
        if (!this.currentFile || !window.pyodideManager) return;

        const content = this.getContent();
        if (!content.trim()) {
            this.showConsoleMessage('No code to run', 'warning');
            return;
        }

        // Clear console if setting is enabled
        if (this.shouldClearConsoleBeforeRun()) {
            this.clearConsole();
        }

        this.showConsoleMessage(`Running ${this.currentFile.name}...`, 'info');

        try {
            const result = await window.pyodideManager.executeCode(content);
            
            if (result.success) {
                if (result.stdout) {
                    this.showConsoleMessage(result.stdout, 'output');
                }
                if (result.stderr) {
                    this.showConsoleMessage(result.stderr, 'warning');
                }
                if (!result.stdout && !result.stderr) {
                    this.showConsoleMessage('Code executed successfully (no output)', 'info');
                }
            } else {
                this.showConsoleMessage(`Error: ${result.error}`, 'error');
                if (result.traceback) {
                    this.showConsoleMessage(result.traceback, 'error');
                }
            }
        } catch (error) {
            this.showConsoleMessage(`Execution error: ${error.message}`, 'error');
        }
    }

    runSelection() {
        if (!this.editor || !window.pyodideManager) return;

        const selection = this.editor.getSelection();
        const selectedText = this.editor.getModel().getValueInRange(selection);
        
        if (!selectedText.trim()) {
            this.showConsoleMessage('No code selected', 'warning');
            return;
        }

        this.showConsoleMessage('Running selection...', 'info');
        
        window.pyodideManager.executeCode(selectedText).then(result => {
            if (result.success) {
                if (result.stdout) {
                    this.showConsoleMessage(result.stdout, 'output');
                }
                if (result.stderr) {
                    this.showConsoleMessage(result.stderr, 'warning');
                }
            } else {
                this.showConsoleMessage(`Error: ${result.error}`, 'error');
            }
        });
    }

    toggleComment() {
        if (!this.editor) return;

        const action = this.editor.getAction('editor.action.commentLine');
        if (action) {
            action.run();
        }
    }

    showConsoleMessage(message, type = 'output') {
        const console = document.getElementById('console-output');
        if (!console) return;

        const timestamp = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        line.innerHTML = `
            <span class="console-timestamp">[${timestamp}]</span>
            <span class="console-message">${this.escapeHtml(message)}</span>
        `;
        
        console.appendChild(line);
        console.scrollTop = console.scrollHeight;
        
        // Switch to output tab
        this.switchConsoleTab('output');
    }

    clearConsole() {
        const console = document.getElementById('console-output');
        if (console) {
            console.innerHTML = '';
        }
    }

    switchConsoleTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.console-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.console-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });
    }

    markFileAsModified() {
        if (this.currentFile) {
            this.currentFile.modified = true;
            if (window.fileManager) {
                window.fileManager.updateTabBar();
            }
        }
    }

    updateCursorPosition() {
        if (!this.editor) return;

        const position = this.editor.getPosition();
        if (position) {
            // Could update status bar with cursor position
            // For now, we'll skip this feature
        }
    }

    setTheme(theme) {
        this.theme = theme;
        if (this.editor) {
            monaco.editor.setTheme(theme);
        }
        this.saveSettings();
    }

    setFontSize(size) {
        this.fontSize = parseInt(size);
        if (this.editor) {
            this.editor.updateOptions({ fontSize: this.fontSize });
        }
        this.saveSettings();
    }

    setWordWrap(enabled) {
        this.wordWrap = enabled;
        if (this.editor) {
            this.editor.updateOptions({ wordWrap: enabled ? 'on' : 'off' });
        }
        this.saveSettings();
    }

    setAutoSave(enabled) {
        this.autoSave = enabled;
        this.saveSettings();
    }

    shouldClearConsoleBeforeRun() {
        // Check setting from settings panel
        const checkbox = document.getElementById('clear-console-checkbox');
        return checkbox ? checkbox.checked : false;
    }

    saveSettings() {
        const settings = {
            theme: this.theme,
            fontSize: this.fontSize,
            wordWrap: this.wordWrap,
            autoSave: this.autoSave
        };
        
        // Use simple variable storage
        window.ideStorage = window.ideStorage || {};
        window.ideStorage['editor-settings'] = settings;
    }

    loadSettings() {
        try {
            if (window.ideStorage && window.ideStorage['editor-settings']) {
                const settings = window.ideStorage['editor-settings'];
                
                if (settings.theme) this.setTheme(settings.theme);
                if (settings.fontSize) this.setFontSize(settings.fontSize);
                if (typeof settings.wordWrap === 'boolean') this.setWordWrap(settings.wordWrap);
                if (typeof settings.autoSave === 'boolean') this.setAutoSave(settings.autoSave);
                
                // Update UI elements
                this.updateSettingsUI();
            }
        } catch (error) {
            console.warn('Failed to load editor settings:', error);
        }
    }

    updateSettingsUI() {
        // Update settings modal elements
        const themeSelect = document.getElementById('theme-select');
        const fontSizeSlider = document.getElementById('font-size-slider');
        const fontSizeValue = document.getElementById('font-size-value');
        const autoSaveCheckbox = document.getElementById('auto-save-checkbox');
        const wordWrapCheckbox = document.getElementById('word-wrap-checkbox');
        
        if (themeSelect) themeSelect.value = this.theme;
        if (fontSizeSlider) {
            fontSizeSlider.value = this.fontSize;
            if (fontSizeValue) fontSizeValue.textContent = `${this.fontSize}px`;
        }
        if (autoSaveCheckbox) autoSaveCheckbox.checked = this.autoSave;
        if (wordWrapCheckbox) wordWrapCheckbox.checked = this.wordWrap;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatCode() {
        if (!this.editor) return;
        
        const action = this.editor.getAction('editor.action.formatDocument');
        if (action) {
            action.run();
        }
    }

    findAndReplace() {
        if (!this.editor) return;
        
        const action = this.editor.getAction('editor.action.startFindReplaceAction');
        if (action) {
            action.run();
        }
    }
}

// Create global instance
window.editorManager = new EditorManager();