// Very basic front-end code runner for Python using Skulpt
// Java execution is placeholder for now (can use API later)

function outf(text) {
    const output = document.getElementById('output');
    output.textContent += text;
}

function runPython(code) {
    output.textContent = '';
    Sk.configure({output:outf, read:builtinRead});
    Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, code, true);
    }).catch(function(err) {
        outf(err.toString());
    });
}

function runJava(code) {
    const output = document.getElementById('output');
    output.textContent = 'Java execution will be supported soon!';
}

document.getElementById('runBtn').addEventListener('click', () => {
    const code = document.getElementById('code').value;
    const lang = document.getElementById('language').value;

    if(lang === 'python') runPython(code);
    else runJava(code);
});
