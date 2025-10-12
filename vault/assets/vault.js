const vaultFiles = [
  {title:"Garden Photo 1", url:"https://www.playbook.com/s/files34/bkBdMJvD5sXY9U9txbu5KgPj?assetToken=m7ZLuUPpz3TaMar3L9WG7JwX", type:"image"},
  {title:"Sky", url:"https://www.playbook.com/s/files34/j1arTpHBKUsEfjVqZGDaCsJy?assetToken=jR9bsa8kqfxyvNYa8hEvRbiS", type:"image"},
  {title:"Home", url:"https://www.playbook.com/s/files34/Uc9mRpfrSdUFe94aHcq5PEK7?assetToken=uiosrTP1xFdUNkVZqHvYPf55", type:"image"},
  {title:"Img1", url:"https://www.playbook.com/s/files34/NqBATg89Xh5FyUKewNBreb1n?assetToken=6NLYrvGAEboFGiZqzosFNNxr", type:"image"},
  {title:"Img2", url:"https://www.playbook.com/s/files34/1Baw8Wv5yzMDqtAPQMfTfoBS?assetToken=MLLNWAvpG9QnSuArj2CxJ8xj", type:"image"},
  {title:"Img3", url:"https://www.playbook.com/s/files34/mnthcBN6Pwe1Ek1rLz4oK73J?assetToken=xFpyyjwwcq9ACSTQ2vC5pmfr", type:"image"},
  {title:"Serial Killer - Alice Hunter.pdf", url:"https://www.playbook.com/s/files34/aciD2CrwowTMpzJLycpn5yvC?assetToken=ner4ZwGJZRjxgGiNyyem2PcB", type:"pdf"},
  {title:"The Greatest Spy Stories Ever Told - Lamar Underwood", url:"https://www.playbook.com/s/files34/sFj9kwQhQHyT7JkT8DJ8XH1M?assetToken=VgvgcJzEpZbjKg5LumEs8op8", type:"pdf"}
];

const grid = document.getElementById('vaultGrid');

function renderVault(files){
  grid.innerHTML = '';
  files.forEach(file => {
    const card = document.createElement('div');
    card.className = 'card';
    let content = `<h3>${file.title}</h3>`;
    if(file.type==="image") content+=`<img src="${file.url}">`;
    if(file.type==="video") content+=`<video controls><source src="${file.url}"></video>`;
    if(file.type==="audio") content+=`<audio controls><source src="${file.url}"></audio>`;
    if(file.type==="pdf") content+=`<a href="${file.url}" target="_blank">Open PDF</a>`;
    card.innerHTML=content;
    grid.appendChild(card);
  });
}

document.getElementById('randomBtn').addEventListener('click', ()=>{
  const random=vaultFiles[Math.floor(Math.random()*vaultFiles.length)];
  window.open(random.url,'_blank');
});

document.getElementById('searchBar').addEventListener('input', e=>{
  const query=e.target.value.toLowerCase();
  const filtered=vaultFiles.filter(f=>f.title.toLowerCase().includes(query));
  renderVault(filtered);
});

renderVault(vaultFiles);
