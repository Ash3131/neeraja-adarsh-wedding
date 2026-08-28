const weddingDate = new Date('2026-09-13T09:45:00+05:30');
const experience = document.querySelector('#experience');
const story = document.querySelector('#story');
const holdButton = document.querySelector('#holdButton');
const musicControl = document.querySelector('#musicControl');
let holdTimer, audioContext, musicTimer, activeNodes = [], playing = false;

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  activeNodes.forEach(node => { try { node.stop(); } catch {} });
  activeNodes = [];
  if (audioContext) audioContext.close();
  audioContext = null; playing = false;
  musicControl.querySelector('.sound-bars').classList.remove('active');
  musicControl.querySelector('.sound-label').textContent = 'Sound off';
  musicControl.setAttribute('aria-label', 'Play background music');
}
function startMusic() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioCtx();
  const master = audioContext.createGain(); master.gain.value = .055;
  const warmth = audioContext.createBiquadFilter(); warmth.type = 'lowpass'; warmth.frequency.value = 1650;
  master.connect(warmth); warmth.connect(audioContext.destination);
  const chords = [[130.81,164.81,196,246.94],[110,130.81,164.81,196],[87.31,130.81,174.61,220],[98,146.83,196,246.94]];
  const melody = [329.63,392,440,392,349.23,329.63,293.66,329.63];
  const note = (frequency,start,duration,volume,type='sine') => { const osc=audioContext.createOscillator(), gain=audioContext.createGain(); osc.type=type; osc.frequency.value=frequency; gain.gain.setValueAtTime(.0001,start); gain.gain.exponentialRampToValueAtTime(volume,start+.7); gain.gain.exponentialRampToValueAtTime(.0001,start+duration); osc.connect(gain); gain.connect(master); osc.start(start); osc.stop(start+duration+.05); activeNodes.push(osc); };
  const schedule = () => { const start=audioContext.currentTime+.08; chords.forEach((chord,index) => { const at=start+index*3.2; chord.forEach((frequency,n) => note(frequency,at,3.05,n===0?.085:.038,n===0?'triangle':'sine')); note(melody[index*2],at+.35,1.35,.022); note(melody[index*2+1],at+1.75,1.15,.018); }); activeNodes=activeNodes.slice(-56); };
  schedule(); musicTimer=setInterval(schedule,12800); playing=true;
  musicControl.querySelector('.sound-bars').classList.add('active');
  musicControl.querySelector('.sound-label').textContent = 'Sound on';
  musicControl.setAttribute('aria-label', 'Pause background music');
}
function toggleMusic() { playing ? stopMusic() : startMusic(); }
musicControl.addEventListener('click', toggleMusic);

function beginHold() { holdButton.classList.add('holding'); holdTimer=setTimeout(() => { experience.classList.remove('locked'); experience.classList.add('opened'); story.setAttribute('aria-hidden','false'); holdButton.classList.remove('holding'); startMusic(); },1400); }
function cancelHold() { holdButton.classList.remove('holding'); clearTimeout(holdTimer); }
holdButton.addEventListener('pointerdown', beginHold);
['pointerup','pointerleave','pointercancel'].forEach(event => holdButton.addEventListener(event,cancelHold));
holdButton.addEventListener('contextmenu', event => event.preventDefault());

const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }), {threshold:.14});
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

function updateCountdown() { const delta=Math.max(0,weddingDate-Date.now()), values={days:Math.floor(delta/86400000),hours:Math.floor(delta/3600000)%24,minutes:Math.floor(delta/60000)%60,seconds:Math.floor(delta/1000)%60}; Object.entries(values).forEach(([id,value]) => document.querySelector(`#${id}`).textContent=String(value).padStart(2,'0')); }
updateCountdown(); setInterval(updateCountdown,1000);

const canvas=document.querySelector('#scratchCanvas'), ratio=window.devicePixelRatio||1, ctx=canvas.getContext('2d');
canvas.width=300*ratio; canvas.height=300*ratio; ctx.scale(ratio,ratio);
ctx.beginPath(); ctx.moveTo(150,276); ctx.bezierCurveTo(130,247,30,187,30,100); ctx.bezierCurveTo(30,28,119,4,150,65); ctx.bezierCurveTo(181,4,270,28,270,100); ctx.bezierCurveTo(270,187,170,247,150,276); ctx.closePath();
const gradient=ctx.createLinearGradient(30,20,270,280); gradient.addColorStop(0,'#80602e'); gradient.addColorStop(.28,'#f8df9c'); gradient.addColorStop(.55,'#a47732'); gradient.addColorStop(.8,'#f4d27c'); gradient.addColorStop(1,'#6e4c20'); ctx.fillStyle=gradient; ctx.fill(); ctx.fillStyle='rgba(42,11,19,.78)'; ctx.font='11px Arial'; ctx.textAlign='center'; ctx.fillText('S C R A T C H   G E N T L Y',150,142); ctx.fillText('T O   R E V E A L',150,161);
let drawing=false,revealed=false; const countOpaque=()=>{ const data=ctx.getImageData(0,0,canvas.width,canvas.height).data; let total=0; for(let i=3;i<data.length;i+=64) if(data[i]>0) total++; return total; }; const initialOpaque=Math.max(1,countOpaque());
function popPetals(){ const holder=document.querySelector('#petals'); for(let i=0;i<24;i++){ const petal=document.createElement('i'); petal.style.setProperty('--i',i); petal.style.setProperty('--x',`${(i*37)%96}%`); petal.style.setProperty('--drift',`${(i%2?1:-1)*(25+(i%5)*10)}px`); petal.style.setProperty('--spin',`${180+(i%4)*90}deg`); holder.appendChild(petal); } setTimeout(()=>holder.replaceChildren(),4200); }
function scratch(event){ if(revealed)return; const rect=canvas.getBoundingClientRect(),x=(event.clientX-rect.left)*(canvas.width/rect.width),y=(event.clientY-rect.top)*(canvas.height/rect.height); ctx.globalCompositeOperation='destination-out'; ctx.beginPath(); ctx.arc(x,y,28*ratio,0,Math.PI*2); ctx.fill(); if(1-countOpaque()/initialOpaque>.36){ revealed=true; canvas.style.opacity='0'; document.querySelector('#revealedTime').classList.add('is-visible'); popPetals(); } }
canvas.addEventListener('pointerdown',event=>{drawing=true;canvas.setPointerCapture(event.pointerId);scratch(event)}); canvas.addEventListener('pointermove',event=>drawing&&scratch(event)); ['pointerup','pointercancel'].forEach(event=>canvas.addEventListener(event,()=>drawing=false));
