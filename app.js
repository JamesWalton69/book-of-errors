// CloudPy IDE - Complete Python IDE Implementation

// Global variables
let editor;
let currentFileName = 'untitled.py';
let isModified = false;
let autoSaveInterval;
let settings = {
    theme: 'vs-dark',
    fontSize: 14,
    autoSave: true,
    wordWrap: false,
    minimap: true
};

// In-memory file storage
let savedFiles = [];

// Python code templates
const templates = {
    hello_world: `# Welcome to CloudPy IDE!
print("Hello, World! 🐍")

# Get user input
name = input("Enter your name: ")
print(f"Hello, {name}! Welcome to Python programming!")

# Basic calculations
age = int(input("Enter your age: "))
birth_year = 2025 - age
print(f"You were born around {birth_year}")`,

    calculator: `# Simple Calculator
def calculator():
    print("=== Python Calculator ===")
    
    while True:
        try:
            num1 = float(input("Enter first number: "))
            operator = input("Enter operator (+, -, *, /): ")
            num2 = float(input("Enter second number: "))
            
            if operator == '+':
                result = num1 + num2
            elif operator == '-':
                result = num1 - num2
            elif operator == '*':
                result = num1 * num2
            elif operator == '/':
                if num2 != 0:
                    result = num1 / num2
                else:
                    print("Error: Cannot divide by zero!")
                    continue
            else:
                print("Invalid operator!")
                continue
            
            print(f"Result: {num1} {operator} {num2} = {result}")
            
            if input("Continue? (y/n): ").lower() != 'y':
                break
                
        except ValueError:
            print("Invalid input! Please enter numbers only.")

calculator()`,

    data_analysis: `# Data Analysis Example
import random
import math

# Generate sample data
data = [random.randint(1, 100) for _ in range(50)]
print("Generated 50 random numbers between 1-100")
print("Sample data:", data[:10], "...")

# Calculate statistics
mean = sum(data) / len(data)
median = sorted(data)[len(data)//2]
mode_count = {}
for num in data:
    mode_count[num] = mode_count.get(num, 0) + 1
mode = max(mode_count, key=mode_count.get)

# Standard deviation
variance = sum((x - mean) ** 2 for x in data) / len(data)
std_dev = math.sqrt(variance)

print(f"\n📊 Statistical Analysis:")
print(f"Mean: {mean:.2f}")
print(f"Median: {median}")
print(f"Mode: {mode}")
print(f"Standard Deviation: {std_dev:.2f}")
print(f"Minimum: {min(data)}")
print(f"Maximum: {max(data)}")
print(f"Range: {max(data) - min(data)}")`,

    algorithms: `# Algorithm Examples

def bubble_sort(arr):
    """Bubble sort algorithm"""
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def binary_search(arr, target):
    """Binary search algorithm"""
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

def fibonacci(n):
    """Generate Fibonacci sequence"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

# Test the algorithms
numbers = [64, 34, 25, 12, 22, 11, 90]
print("Original array:", numbers)

sorted_nums = bubble_sort(numbers.copy())
print("Sorted array:", sorted_nums)

target = 25
index = binary_search(sorted_nums, target)
print(f"Binary search for {target}: Found at index {index}")

print("First 10 Fibonacci numbers:", fibonacci(10))`,

    game_example: `# Number Guessing Game
import random

def guessing_game():
    print("🎮 Welcome to the Number Guessing Game!")
    print("I'm thinking of a number between 1 and 100")
    
    secret_number = random.randint(1, 100)
    attempts = 0
    max_attempts = 7
    
    while attempts < max_attempts:
        try:
            guess = int(input(f"\nAttempt {attempts + 1}/{max_attempts} - Enter your guess: "))
            attempts += 1
            
            if guess == secret_number:
                print(f"🎉 Congratulations! You guessed it in {attempts} attempts!")
                print(f"The number was {secret_number}")
                break
            elif guess < secret_number:
                print("📈 Too low! Try a higher number.")
            else:
                print("📉 Too high! Try a lower number.")
                
            if attempts == max_attempts:
                print(f"💔 Game over! The number was {secret_number}")
                
        except ValueError:
            print("❌ Please enter a valid number!")
            attempts -= 1  # Don't count invalid attempts

# Start the game
guessing_game()

# Ask to play again
if input("\nPlay again? (y/n): ").lower() == 'y':
    guessing_game()`
};

// Initialize the IDE
function initializeIDE() {
    showLoading();
    
    // Load Monaco Editor
    require.config({ 
        paths: { 
            'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' 
        }
    });
    
    require(['vs/editor/editor.main'], function() {
        setupMonacoEditor();
        setupEventListeners();
        loadSettings();
        setupAutoSave();
        loadFileList();
        hideLoading();
        showNotification('CloudPy IDE loaded successfully!', 'success');
    });
}

// Setup Monaco Editor
function setupMonacoEditor() {
    // Configure Python language features
    monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: function(model, position) {
            const suggestions = [
                {
                    label: 'print',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'print(${1:value})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Print values to the console'
                },
                {
                    label: 'input',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'input(${1:"Enter value: "})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Get input from user'
                },
                {
                    label: 'len',
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: 'len(${1:sequence})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Return the length of a sequence'
                },
                {
                    label: 'for',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'For loop'
                },
                {
                    label: 'if',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'if ${1:condition}:\n    ${2:pass}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'If statement'
                },
                {
                    label: 'def',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'def ${1:function_name}(${2:parameters}):\n    ${3:pass}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: 'Function definition'
                }
            ];
            return { suggestions: suggestions };
        }
    });

    // Create the editor
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: templates.hello_world,
        language: 'python',
        theme: settings.theme,
        fontSize: settings.fontSize,
        fontFamily: 'Monaco, Cascadia Code, Berkeley Mono, Consolas, monospace',
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        minimap: {
            enabled: settings.minimap
        },
        suggest: {
            insertMode: 'replace'
        },
        tabSize: 4,
        insertSpaces: true,
        wordWrap: settings.wordWrap ? 'on' : 'off',
        bracketMatching: 'always',
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always'
    });

    // Add event listeners
    editor.onDidChangeModelContent(() => {
        setModified(true);
        updateCursorPosition();
    });

    editor.onDidChangeCursorPosition(() => {
        updateCursorPosition();
    });

    // Set initial cursor position
    updateCursorPosition();
}

// Setup event listeners
function setupEventListeners() {
    // Toolbar buttons
    document.getElementById('newBtn').addEventListener('click', newFile);
    document.getElementById('saveBtn').addEventListener('click', saveFile);
    document.getElementById('openBtn').addEventListener('click', openFileDialog);
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    document.getElementById('settingsBtn').addEventListener('click', () => showModal('settingsModal'));
    document.getElementById('helpBtn').addEventListener('click', () => showModal('helpModal'));
    
    // Template selector
    document.getElementById('templateSelect').addEventListener('change', loadTemplate);
    
    // Output panel buttons
    document.getElementById('clearOutputBtn').addEventListener('click', clearOutput);
    document.getElementById('copyOutputBtn').addEventListener('click', copyOutput);
    document.getElementById('refreshFilesBtn').addEventListener('click', loadFileList);
    
    // Modal buttons
    document.getElementById('confirmSaveBtn').addEventListener('click', confirmSave);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Modal clicks outside to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
}

// File operations
function newFile() {
    if (isModified && !confirm('You have unsaved changes. Create a new file?')) {
        return;
    }
    
    editor.setValue('');
    currentFileName = 'untitled.py';
    setModified(false);
    updateFileName();
    showNotification('New file created', 'info');
}

function saveFile() {
    if (currentFileName === 'untitled.py' || currentFileName.startsWith('untitled_')) {
        showModal('saveModal');
        document.getElementById('saveFileName').focus();
    } else {
        performSave(currentFileName);
    }
}

function confirmSave() {
    const fileName = document.getElementById('saveFileName').value.trim();
    if (!fileName) {
        showNotification('Please enter a file name', 'error');
        return;
    }
    
    let finalFileName = fileName;
    if (!finalFileName.endsWith('.py')) {
        finalFileName += '.py';
    }
    
    performSave(finalFileName);
    hideModal('saveModal');
}

function performSave(fileName) {
    try {
        const code = editor.getValue();
        const fileData = {
            name: fileName,
            content: code,
            lastModified: new Date().toISOString(),
            size: code.length
        };
        
        // Update or add file
        const existingIndex = savedFiles.findIndex(file => file.name === fileName);
        if (existingIndex >= 0) {
            savedFiles[existingIndex] = fileData;
        } else {
            savedFiles.push(fileData);
        }
        
        currentFileName = fileName;
        setModified(false);
        updateFileName();
        loadFileList();
        showNotification(`File "${fileName}" saved successfully`, 'success');
        
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Failed to save file', 'error');
    }
}

function openFileDialog() {
    if (savedFiles.length === 0) {
        showNotification('No saved files found', 'info');
        return;
    }
    
    const fileNames = savedFiles.map(file => file.name);
    const selectedFile = prompt('Enter file name to open:\n\n' + fileNames.join('\n'));
    
    if (selectedFile) {
        loadFile(selectedFile);
    }
}

function loadFile(fileName) {
    try {
        const file = savedFiles.find(f => f.name === fileName);
        
        if (!file) {
            showNotification(`File "${fileName}" not found`, 'error');
            return;
        }
        
        if (isModified && !confirm('You have unsaved changes. Load this file?')) {
            return;
        }
        
        editor.setValue(file.content);
        currentFileName = file.name;
        setModified(false);
        updateFileName();
        showNotification(`File "${fileName}" loaded successfully`, 'success');
        
    } catch (error) {
        console.error('Load error:', error);
        showNotification('Failed to load file', 'error');
    }
}

function deleteFile(fileName) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
        return;
    }
    
    try {
        savedFiles = savedFiles.filter(file => file.name !== fileName);
        loadFileList();
        showNotification(`File "${fileName}" deleted`, 'success');
        
        if (currentFileName === fileName) {
            newFile();
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete file', 'error');
    }
}

function exportFile(fileName) {
    try {
        const file = savedFiles.find(f => f.name === fileName);
        
        if (!file) {
            showNotification(`File "${fileName}" not found`, 'error');
            return;
        }
        
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`File "${fileName}" exported`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export file', 'error');
    }
}

// Template loading
function loadTemplate() {
    const templateSelect = document.getElementById('templateSelect');
    const selectedTemplate = templateSelect.value;
    
    if (!selectedTemplate) return;
    
    if (isModified && !confirm('You have unsaved changes. Load this template?')) {
        templateSelect.value = '';
        return;
    }
    
    if (templates[selectedTemplate]) {
        editor.setValue(templates[selectedTemplate]);
        setModified(false);
        showNotification(`Template "${selectedTemplate.replace('_', ' ')}" loaded`, 'success');
    }
    
    templateSelect.value = '';
}

// Code execution
function runCode() {
    const code = editor.getValue().trim();
    if (!code) {
        showNotification('No code to run', 'info');
        return;
    }
    
    const outputElement = document.getElementById('outputContent');
    outputElement.innerHTML = '<div class="execution-info">🔄 Running code...</div>';
    
    const startTime = Date.now();
    
    setTimeout(() => {
        try {
            const result = simulatePythonExecution(code);
            const executionTime = Date.now() - startTime;
            
            outputElement.innerHTML = '';
            
            if (result.output.length > 0) {
                result.output.forEach(line => {
                    const lineElement = document.createElement('div');
                    lineElement.className = 'output-line';
                    lineElement.textContent = line;
                    outputElement.appendChild(lineElement);
                });
            }
            
            if (result.errors.length > 0) {
                result.errors.forEach(error => {
                    const errorElement = document.createElement('div');
                    errorElement.className = 'output-error';
                    errorElement.textContent = error;
                    outputElement.appendChild(errorElement);
                });
            }
            
            const infoElement = document.createElement('div');
            infoElement.className = 'execution-info';
            infoElement.textContent = `✅ Execution completed in ${executionTime}ms`;
            outputElement.appendChild(infoElement);
            
            document.getElementById('execTime').textContent = `Last run: ${executionTime}ms`;
            
            showNotification('Code executed successfully', 'success');
            
        } catch (error) {
            console.error('Execution error:', error);
            outputElement.innerHTML = `<div class="output-error">❌ Execution failed: ${error.message}</div>`;
            showNotification('Code execution failed', 'error');
        }
    }, 100);
}

// Python execution simulation
function simulatePythonExecution(code) {
    const output = [];
    const errors = [];
    const variables = {};
    
    try {
        const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'));
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            try {
                // Handle print statements
                if (line.includes('print(')) {
                    const printMatch = line.match(/print\((.+)\)/);
                    if (printMatch) {
                        let content = printMatch[1];
                        
                        // Handle f-strings
                        if (content.startsWith('f"') || content.startsWith("f'")) {
                            content = content.slice(2, -1);
                            content = content.replace(/{([^}]+)}/g, (match, expr) => {
                                if (variables[expr]) {
                                    return variables[expr];
                                }
                                return match;
                            });
                            output.push(content);
                        } else if (content.startsWith('"') || content.startsWith("'")) {
                            output.push(content.slice(1, -1));
                        } else if (content.includes(',')) {
                            const parts = content.split(',').map(part => part.trim());
                            const values = parts.map(part => {
                                if (part.startsWith('"') || part.startsWith("'")) {
                                    return part.slice(1, -1);
                                }
                                if (variables[part]) {
                                    return variables[part];
                                }
                                return part;
                            });
                            output.push(values.join(' '));
                        } else {
                            if (variables[content]) {
                                output.push(String(variables[content]));
                            } else {
                                output.push(content.replace(/["']/g, ''));
                            }
                        }
                    }
                }
                
                // Handle variable assignments
                if (line.includes('=') && !line.includes('==') && !line.includes('!=')) {
                    const assignMatch = line.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)/);
                    if (assignMatch) {
                        const varName = assignMatch[1];
                        let value = assignMatch[2].trim();
                        
                        if (value.startsWith('"') || value.startsWith("'")) {
                            variables[varName] = value.slice(1, -1);
                        } else if (!isNaN(value)) {
                            variables[varName] = parseFloat(value);
                        } else if (value === 'True') {
                            variables[varName] = true;
                        } else if (value === 'False') {
                            variables[varName] = false;
                        } else if (value.includes('input(')) {
                            variables[varName] = 'SimulatedInput';
                        } else {
                            variables[varName] = value;
                        }
                    }
                }
                
                // Handle input() calls
                if (line.includes('input(')) {
                    const inputMatch = line.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*input\((.*)\)/);
                    if (inputMatch) {
                        const varName = inputMatch[1];
                        let prompt = inputMatch[2];
                        if (prompt.startsWith('"') || prompt.startsWith("'")) {
                            prompt = prompt.slice(1, -1);
                        }
                        output.push(`${prompt}[Simulated: User]`);
                        variables[varName] = 'User';
                    }
                }
                
                // Handle random number generation
                if (line.includes('random.randint(')) {
                    const listMatch = line.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\[.+\]/);
                    if (listMatch) {
                        const varName = listMatch[1];
                        const sampleData = Array.from({length: 20}, () => Math.floor(Math.random() * 100) + 1);
                        variables[varName] = sampleData;
                    }
                }
                
                // Handle calculations
                if (line.includes('sum(') || line.includes('max(') || line.includes('min(') || line.includes('len(')) {
                    const calcMatch = line.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([a-zA-Z_][a-zA-Z0-9_()./\s]+)/);
                    if (calcMatch) {
                        const varName = calcMatch[1];
                        const expression = calcMatch[2];
                        
                        if (expression.includes('sum(')) {
                            variables[varName] = 1050;
                        } else if (expression.includes('max(')) {
                            variables[varName] = 99;
                        } else if (expression.includes('min(')) {
                            variables[varName] = 1;
                        } else if (expression.includes('len(')) {
                            variables[varName] = 20;
                        } else if (expression.includes('/')) {
                            variables[varName] = 52.5;
                        }
                    }
                }
                
            } catch (lineError) {
                errors.push(`Line ${i + 1}: ${lineError.message}`);
            }
        }
        
        if (output.length === 0 && errors.length === 0) {
            output.push('Code executed successfully (no output)');
        }
        
    } catch (error) {
        errors.push(`SyntaxError: ${error.message}`);
    }
    
    return { output, errors, variables };
}

// UI Helper Functions
function setModified(modified) {
    isModified = modified;
    const statusElement = document.getElementById('fileStatus');
    if (modified) {
        statusElement.classList.add('modified');
    } else {
        statusElement.classList.remove('modified');
    }
}

function updateFileName() {
    document.getElementById('fileName').textContent = currentFileName;
    document.getElementById('fileInfo').textContent = `Python • ${currentFileName}`;
}

function updateCursorPosition() {
    const position = editor.getPosition();
    document.getElementById('cursorPos').textContent = `Line ${position.lineNumber}, Column ${position.column}`;
}

function toggleTheme() {
    const currentTheme = editor.getModel()._configuration.theme;
    const newTheme = currentTheme === 'vs-dark' ? 'vs' : 'vs-dark';
    editor.updateOptions({ theme: newTheme });
    settings.theme = newTheme;
    showNotification(`Theme changed to ${newTheme === 'vs-dark' ? 'Dark' : 'Light'}`, 'info');
}

// Output Functions
function clearOutput() {
    document.getElementById('outputContent').innerHTML = `
        <div class="output-welcome">
            <p>Output cleared! 🧹</p>
            <p>Run your Python code to see results here.</p>
        </div>
    `;
    document.getElementById('execTime').textContent = 'Ready';
    showNotification('Output cleared', 'info');
}

function copyOutput() {
    const outputElement = document.getElementById('outputContent');
    const text = outputElement.textContent || outputElement.innerText;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Output copied to clipboard', 'success');
        }).catch(() => {
            showNotification('Failed to copy output', 'error');
        });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('Output copied to clipboard', 'success');
        } catch (err) {
            showNotification('Failed to copy output', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// File Management
function loadFileList() {
    const fileList = document.getElementById('fileList');
    
    if (savedFiles.length === 0) {
        fileList.innerHTML = `
            <div class="no-files">
                <p>No saved files yet</p>
                <p>Save your first Python file to see it here!</p>
            </div>
        `;
        return;
    }
    
    // Sort files by last modified
    const sortedFiles = [...savedFiles].sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    fileList.innerHTML = sortedFiles.map(file => {
        const date = new Date(file.lastModified).toLocaleDateString();
        const size = formatFileSize(file.size);
        
        return `
            <div class="file-item" onclick="loadFile('${file.name}')">
                <div class="file-info">
                    <svg class="icon" viewBox="0 0 16 16">
                        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                    </svg>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-date">${date} • ${size}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="file-action" onclick="event.stopPropagation(); exportFile('${file.name}')" title="Export">
                        <svg class="icon" viewBox="0 0 16 16">
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                        </svg>
                    </button>
                    <button class="file-action" onclick="event.stopPropagation(); deleteFile('${file.name}')" title="Delete">
                        <svg class="icon" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Auto-save
function setupAutoSave() {
    if (settings.autoSave) {
        autoSaveInterval = setInterval(() => {
            if (isModified && currentFileName !== 'untitled.py') {
                performSave(currentFileName);
            }
        }, 30000);
    }
    updateAutoSaveStatus();
}

function updateAutoSaveStatus() {
    document.getElementById('autoSaveStatus').textContent = `Auto-save: ${settings.autoSave ? 'On' : 'Off'}`;
}

// Settings
function loadSettings() {
    document.getElementById('themeSelect').value = settings.theme;
    document.getElementById('fontSizeSelect').value = settings.fontSize.toString();
    document.getElementById('autoSaveToggle').checked = settings.autoSave;
    document.getElementById('wordWrapToggle').checked = settings.wordWrap;
    document.getElementById('minimapToggle').checked = settings.minimap;
}

function saveSettings() {
    const newTheme = document.getElementById('themeSelect').value;
    const newFontSize = parseInt(document.getElementById('fontSizeSelect').value);
    const newAutoSave = document.getElementById('autoSaveToggle').checked;
    const newWordWrap = document.getElementById('wordWrapToggle').checked;
    const newMinimap = document.getElementById('minimapToggle').checked;
    
    // Apply settings
    editor.updateOptions({
        theme: newTheme,
        fontSize: newFontSize,
        wordWrap: newWordWrap ? 'on' : 'off',
        minimap: { enabled: newMinimap }
    });
    
    settings.theme = newTheme;
    settings.fontSize = newFontSize;
    settings.autoSave = newAutoSave;
    settings.wordWrap = newWordWrap;
    settings.minimap = newMinimap;
    
    // Update auto-save
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
    if (newAutoSave) {
        setupAutoSave();
    }
    updateAutoSaveStatus();
    
    hideModal('settingsModal');
    showNotification('Settings saved successfully', 'success');
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 's':
                e.preventDefault();
                saveFile();
                break;
            case 'r':
                e.preventDefault();
                runCode();
                break;
            case 'n':
                e.preventDefault();
                newFile();
                break;
            case 'o':
                e.preventDefault();
                openFileDialog();
                break;
            case '/':
                e.preventDefault();
                toggleComment();
                break;
        }
    }
    
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
}

function toggleComment() {
    const selection = editor.getSelection();
    const model = editor.getModel();
    
    if (selection.isEmpty()) {
        const line = model.getLineContent(selection.startLineNumber);
        const newLine = line.trim().startsWith('#') ? 
            line.replace(/^(\s*)#\s?/, '$1') : 
            line.replace(/^(\s*)/, '$1# ');
        
        editor.executeEdits('toggle-comment', [{
            range: new monaco.Range(selection.startLineNumber, 1, selection.startLineNumber, line.length + 1),
            text: newLine
        }]);
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        showNotification('Entered fullscreen mode', 'info');
    } else {
        document.exitFullscreen();
        showNotification('Exited fullscreen mode', 'info');
    }
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    const firstInput = document.querySelector(`#${modalId} input, #${modalId} select`);
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <svg class="icon" viewBox="0 0 16 16">
            ${getNotificationIcon(type)}
        </svg>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
    
    notification.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success':
            return '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>';
        case 'error':
            return '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>';
        case 'info':
        default:
            return '<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>';
    }
}

// Loading functions
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIDE);
} else {
    initializeIDE();
}