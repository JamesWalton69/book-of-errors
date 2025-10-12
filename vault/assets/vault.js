// Vault JavaScript

// Placeholder Vault files
const vaultFiles = [
  { title: "File 1", url: "#" },
  { title: "File 2", url: "#" },
  { title: "File 3", url: "#" },
  { title: "File 4", url: "#" },
  { title: "File 5", url: "#" },
  { title: "File 6", url: "#" }
];

// Populate Vault grid
const grid = document.getElementById('vaultGrid');

function renderVault(files) {
  grid.innerHTML = '';
  files.forEach(file => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${file.title}</h3><a href="${file.url}" target="_blank">Open / Download</a>`;
    grid.appendChild(card);
  });
}

// Random Vault File
document.getElementById('randomBtn').addEventListener('click', () => {
  const random = vaultFiles[Math.floor(Math.random() * vaultFiles.length)];
  window.open(random.url, '_blank');
});

// Search / Filter Vault
document.getElementById('searchBar').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = vaultFiles.filter(f => f.title.toLowerCase().includes(query));
  renderVault(filtered);
});

// Initial render
renderVault(vaultFiles);
