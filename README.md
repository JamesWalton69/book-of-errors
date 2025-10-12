# Vault & Garden 🌿📚💻

Vault & Garden is a **personal cloud workspace and online platform** that lets you:  

- Organize and access your **images, videos, PDFs, and code files** from Playbook links.  
- Explore an interactive **Garden** with a blue-yellow gradient background and Zen quotes.  
- Experiment in a **Code Lab** with Python and Java sample codes.  
- Add new files dynamically through a **Upload UI** linked to your Playbook assets.  

This project is fully hosted on **GitHub Pages** and integrated with **Playbook** links for seamless access.

---

## 🌐 Website Links

- **Home:** `/index.html`  
- **Landing Page:** `/index2.html`  
- **Vault:** `/vault/index.html`  
- **Garden:** `/garden/index.html`  
- **Code Lab:** `/code-lab/index.html`  
- **Upload UI:** `/upload-ui/index.html`  

---

## 🎨 Features

### Vault
- Browse images, videos, PDFs, and code files.  
- Search functionality for quick access.  
- Random file opener for exploration.

### Garden
- Beautiful blue-yellow gradient background.  
- Zen Mode with inspirational quotes.  
- Garden images integrated from Playbook.

### Code Lab
- Access sample Python and Java code.  
- Open code files directly from Playbook links.

### Upload UI
- Add new files dynamically to Vault.  
- Store new entries in **localStorage** for instant access.

---

## 🗂️ Project Structure

```
vault-and-garden/               # Root folder
│
├─ index.html                   # Home page
├─ index2.html                  # Landing page
├─ assets/                      # Shared assets
│   ├─ style.css                # Main CSS
│   ├─ favicon.svg              # Favicon
│   ├─ logo-home.svg            # Home page logo
│   └─ logo-codelab.svg         # Code Lab logo
│
├─ vault/                       # Vault section
│   ├─ index.html               # Vault main page
│   └─ assets/
│       ├─ vault.css            # Vault CSS
│       └─ vault.js             # Vault JS
│
├─ garden/                      # Garden section
│   ├─ index.html               # Garden main page
│   └─ assets/
│       ├─ garden.css           # Garden CSS
│       └─ garden.js            # Garden JS
│
├─ code-lab/                    # Code Lab section
│   ├─ index.html               # Code Lab main page
│   └─ assets/
│       ├─ codelab.css          # Code Lab CSS
│       └─ codelab.js           # Code Lab JS
│
└─ upload-ui/                   # Upload UI section
    ├─ index.html               # Upload page
    └─ assets/
        ├─ upload.css           # Upload CSS
        └─ upload.js            # Upload JS
```

---

## ⚡ Usage

1. Clone the repository:  
```bash
git clone https://github.com/<your-username>/vault-and-garden.git
```

2. Open `index.html` or `index2.html` in your browser to explore.  
3. Vault and Code Lab automatically fetch your Playbook assets.  
4. Use Upload UI to add more files dynamically.

---

## 🛠️ Technologies Used

- HTML5 & CSS3  
- JavaScript (ES6+)  
- GitHub Pages hosting  
- Playbook for cloud storage and asset management

---

## 📂 Adding New Files

1. Go to **Upload UI**: `/upload-ui/index.html`.  
2. Enter **file title**, **Playbook URL**, and **type** (image, video, PDF, code).  
3. Click **Add to Vault** → File is added immediately.  

> Tip: You can also edit `vault/assets/vault.js` directly to preload files in Vault.

---

## 📌 License

MIT License © 2025 Vault & Garden

---

## 🚀 Screenshots

*(Optional: Add screenshots of Home, Garden, Vault, and Code Lab here for better presentation)*