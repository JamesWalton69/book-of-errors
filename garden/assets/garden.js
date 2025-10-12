const quotes=["Dreams are memories from futures that never happened.","Reality is just a well-rendered illusion.","Silence often speaks louder than words.","The mind is a garden; thoughts are seeds.","What you imagine can shape your reality.","Wisdom often hides in simplicity.","Even chaos has a rhythm."];
const container=document.getElementById('quoteContainer');
const zenBtn=document.getElementById('zenBtn');
function showRandomQuote(){const quoteText=quotes[Math.floor(Math.random()*quotes.length)];const quoteDiv=document.createElement('div');quoteDiv.className='quote';quoteDiv.textContent=quoteText;container.innerHTML='';container.appendChild(quoteDiv);setTimeout(()=>{quoteDiv.classList.add('show');},100);}
showRandomQuote();
zenBtn.addEventListener('click',()=>{document.body.classList.toggle('zen-mode');if(document.body.classList.contains('zen-mode')){document.body.style.backgroundColor='#000';document.body.style.color='#00d4ff';}else{document.body.style.backgroundColor='linear-gradient(135deg,#00d4ff,#ffcc00)';document.body.style.color='#0d0d0d';}});
