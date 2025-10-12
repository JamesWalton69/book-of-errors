const form = document.getElementById('uploadForm');
const vaultList = document.getElementById('vaultFilesList');

function loadVault(){
    const files = JSON.parse(localStorage.getItem('vaultFiles') || '[]');
    vaultList.innerHTML='';
    files.forEach(f=>{
        const div=document.createElement('div');
        div.innerHTML=`${f.title} [${f.type}] - <a href="${f.url}" target="_blank">Open</a>`;
        vaultList.appendChild(div);
    });
}

form.addEventListener('submit', e=>{
    e.preventDefault();
    const title=document.getElementById('fileTitle').value;
    const url=document.getElementById('fileUrl').value;
    const type=document.getElementById('fileType').value;
    const files=JSON.parse(localStorage.getItem('vaultFiles') || '[]');
    files.push({title,url,type});
    localStorage.setItem('vaultFiles',JSON.stringify(files));
    form.reset();
    loadVault();
});

loadVault();
