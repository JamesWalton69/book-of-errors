// Load Monaco Editor
require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });
require(['vs/editor/editor.main'], async function () {
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: `print("Hello, Python IDE!")`,
    language: 'python',
    theme: 'vs-dark',
    automaticLayout: true
  });

  // Load Pyodide
  const pyodide = await loadPyodide();

  document.getElementById('runBtn').onclick = async () => {
    const code = editor.getValue();
    try {
      const result = await pyodide.runPythonAsync(code);
      document.getElementById('output').textContent = result ?? "No output";
    } catch (err) {
      document.getElementById('output').textContent = err;
    }
  };
});
