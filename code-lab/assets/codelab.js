const codeFiles = [
  { title: "Binomial Theorem", url: "https://drive.google.com/uc?export=download&id=1Gv80_yuDUCH3MWwrl-ANJyxeS9I4lksh", type:"code" },
  { title: "Question 21", url: "https://www.playbook.com/s/files34/KPnnyGUQV1QtkDqF1G3uvvNj?assetToken=bYndYSVEMNkdKWKrfKjjKwBh", type:"code" }
];

const grid = document.getElementById('codeGrid');

function renderCode(files){
  grid.innerHTML = '';
  files.forEach(file=>{
    const card=document.createElement('div');
    card.className='card';
    card.innerHTML=`<h3>${file.title}</h3>
    <a href="${file.url}" target="_blank">Open Code File</a>`;
    grid.appendChild(card);
  });
}

renderCode(codeFiles);
