const quotes = [
    "Dreams are memories from futures that never happened.",
    "Reality is just a well-rendered illusion.",
    "Silence often speaks louder than words.",
    "The mind is a garden; thoughts are seeds.",
    "What you imagine can shape your reality.",
    "Wisdom often hides in simplicity.",
    "Even chaos has a rhythm."
];

const container = document.getElementById('quoteContainer');
const zenBtn = document.getElementById('zenBtn');

function showRandomQuote() {
    const quoteText = quotes[Math.floor(Math.random()*quotes.length)];
    container.innerHTML = `<div class="quote show">${quoteText}</div>`;
}

zenBtn.addEventListener('click', () => {
    document.body.classList.toggle('zenMode');
    showRandomQuote();
});

showRandomQuote();
