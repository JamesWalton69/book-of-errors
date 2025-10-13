class PyodideManager {
    constructor() {
        this.pyodide = null;
        this.isReady = false;
        this.isLoading = false;
        this.installedPackages = new Set(['sys', 'os', 'math', 'random', 'json']);
        this.executionQueue = [];
        this.isExecuting = false;
    }

    async initialize() {
        if (this.isLoading || this.isReady) return;
        
        this.isLoading = true;
        this.updateLoadingStatus('Loading Pyodide runtime...', 20);
        
        try {
            // Load Pyodide
            this.pyodide = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/'
            });
            
            this.updateLoadingStatus('Setting up Python environment...', 60);
            
            // Setup basic imports and utilities
            await this.pyodide.runPython(`
import sys
import io
import traceback
from contextlib import redirect_stdout, redirect_stderr

# Create string buffers for capturing output
_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()

def get_output():
    """Get captured stdout and stderr"""
    stdout = _stdout_buffer.getvalue()
    stderr = _stderr_buffer.getvalue()
    _stdout_buffer.truncate(0)
    _stdout_buffer.seek(0)
    _stderr_buffer.truncate(0)
    _stderr_buffer.seek(0)
    return stdout, stderr

def run_code_safe(code):
    """Safely execute code and capture output"""
    try:
        with redirect_stdout(_stdout_buffer), redirect_stderr(_stderr_buffer):
            # Compile and execute the code
            compiled_code = compile(code, '<user_input>', 'exec')
            exec(compiled_code, globals())
        
        stdout, stderr = get_output()
        return {
            'success': True,
            'stdout': stdout,
            'stderr': stderr,
            'error': None
        }
    except Exception as e:
        stdout, stderr = get_output()
        return {
            'success': False,
            'stdout': stdout,
            'stderr': stderr,
            'error': str(e),
            'traceback': traceback.format_exc()
        }
            `);
            
            this.updateLoadingStatus('Python environment ready!', 100);
            
            this.isReady = true;
            this.isLoading = false;
            
            // Hide loading screen and show IDE
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('ide-container').classList.remove('hidden');
                
                // Notify other components that Pyodide is ready
                window.dispatchEvent(new CustomEvent('pyodideReady'));
            }, 500);
            
        } catch (error) {
            console.error('Failed to load Pyodide:', error);
            this.updateLoadingStatus('Failed to load Python runtime', 0);
            this.isLoading = false;
        }
    }

    updateLoadingStatus(message, progress) {
        const statusElement = document.getElementById('loading-status');
        const progressBar = document.getElementById('loading-bar');
        
        if (statusElement) statusElement.textContent = message;
        if (progressBar) progressBar.style.width = `${progress}%`;
    }

    async executeCode(code) {
        if (!this.isReady) {
            throw new Error('Python runtime not ready');
        }

        if (this.isExecuting) {
            this.executionQueue.push(code);
            return;
        }

        this.isExecuting = true;
        this.updateStatus('running', 'Running...');

        try {
            // Use the safe execution function we defined in Python
            const result = this.pyodide.runPython(`run_code_safe(${JSON.stringify(code)})`);
            
            this.updateStatus('ready', 'Ready');
            this.isExecuting = false;
            
            // Process next item in queue
            if (this.executionQueue.length > 0) {
                const nextCode = this.executionQueue.shift();
                setTimeout(() => this.executeCode(nextCode), 100);
            }
            
            return result;
        } catch (error) {
            this.updateStatus('error', 'Error');
            this.isExecuting = false;
            
            return {
                success: false,
                stdout: '',
                stderr: '',
                error: error.message,
                traceback: error.stack || ''
            };
        }
    }

    async installPackage(packageName) {
        if (!this.isReady) {
            throw new Error('Python runtime not ready');
        }

        if (this.installedPackages.has(packageName)) {
            return { success: true, message: `${packageName} is already installed` };
        }

        this.updateStatus('running', `Installing ${packageName}...`);

        try {
            // Install using micropip
            await this.pyodide.runPython(`
import micropip
await micropip.install('${packageName}')
            `);
            
            this.installedPackages.add(packageName);
            this.updateStatus('ready', 'Ready');
            
            return { 
                success: true, 
                message: `Successfully installed ${packageName}` 
            };
        } catch (error) {
            this.updateStatus('error', 'Error');
            
            return { 
                success: false, 
                message: `Failed to install ${packageName}: ${error.message}` 
            };
        }
    }

    async runInteractiveCode(code) {
        if (!this.isReady) {
            return { success: false, error: 'Python runtime not ready' };
        }

        try {
            // For interactive terminal, we'll use a simpler approach
            const result = this.pyodide.runPython(code);
            
            return {
                success: true,
                result: result !== undefined ? String(result) : '',
                stdout: '',
                stderr: ''
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                traceback: error.stack || ''
            };
        }
    }

    getInstalledPackages() {
        return Array.from(this.installedPackages).sort();
    }

    updateStatus(type, message) {
        const indicator = document.getElementById('status-indicator');
        const text = document.getElementById('status-text');
        
        if (indicator) {
            indicator.className = `status-indicator ${type}`;
        }
        
        if (text) {
            text.textContent = message;
        }
        
        // Update toolbar buttons
        const runBtn = document.getElementById('run-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (type === 'running') {
            if (runBtn) runBtn.classList.add('hidden');
            if (stopBtn) stopBtn.classList.remove('hidden');
        } else {
            if (runBtn) runBtn.classList.remove('hidden');
            if (stopBtn) stopBtn.classList.add('hidden');
        }
    }

    stopExecution() {
        // Note: Pyodide doesn't support interrupting execution
        // This is a limitation of the current implementation
        console.warn('Stopping execution is not supported in Pyodide');
        this.updateStatus('ready', 'Ready');
    }

    async evaluateExpression(expression) {
        if (!this.isReady) {
            return null;
        }

        try {
            const result = this.pyodide.runPython(expression);
            return result;
        } catch (error) {
            return null;
        }
    }
}

// Create global instance
window.pyodideManager = new PyodideManager();