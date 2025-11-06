(() => {
  const stage   = document.getElementById('cakeStage');
  const cake    = document.getElementById('cake');
  const body    = document.getElementById('cakeBody');
  const candle  = document.getElementById('candle');
  const flame   = document.getElementById('flame');
  const fxLayer = document.getElementById('fxLayer');
  const replay  = document.getElementById('replay');
  const blowBtn = document.getElementById('blow');
  const msgBox  = document.getElementById('hbMessage');
  const msgText = document.getElementById('msgText');
  const gar1 = document.getElementById('gar1');
  const gar2 = document.getElementById('gar2');

  const NAME = "Arzish";
  const MESSAGE_TEXT = `Happy Birthday ${NAME}!`;
  const SHOW_TABLE = true;
  const BALLOON_COUNT = 13;
  const CONFETTI_COUNT = 70;
  const BALLOON_SPEED = 2.7;

  const g = 0.55;
  const restitution = 0.62;

  let dropping = false;
  let blown = false;
  let rafId;

  const table = stage.querySelector('.table');
  if (table) table.style.display = SHOW_TABLE ? 'block' : 'none';

  msgText.textContent = MESSAGE_TEXT;

  const px = n => `${n}px`;
  const rand = (a,b) => Math.random()*(b-a)+a;
  const computeGroundY = () => Math.round(stage.clientHeight * 0.66);

  function placeCakeOnGround(){
    const groundY = computeGroundY();
    const cakeH = cake.getBoundingClientRect().height || 120;
    cake.style.top = px(groundY - cakeH);
  }
  function clearFX(){ fxLayer.innerHTML = ''; }
  function getCandleTip(){
    const cRect = candle.getBoundingClientRect();
    const sRect = stage.getBoundingClientRect();
    return { x: (cRect.left - sRect.left) + cRect.width/2, y: (cRect.top  - sRect.top)  + 6 };
  }

  function buildGarland(el, word, palette){
    el.innerHTML = '';
    const w = el.clientWidth || 300;
    const count = word.length;
    for (let i=0;i<count;i++){
      const d = document.createElement('div');
      d.className = 'card';
      d.textContent = word[i];
      const left = (i/(count-1||1)) * 100;
      d.style.left = `${left}%`;
      d.style.setProperty('--bg', palette[i % palette.length]);
      d.style.setProperty('--tilt', `${rand(4,8)}deg`);
      d.style.setProperty('--d', `${rand(2.1,2.9)}s`);
      d.style.setProperty('--delay', `${Math.random()*350|0}ms`);
      el.appendChild(d);
    }
  }

  function initGarlands(){
    const colors = ['#ff4f88','#ffd166','#00bbf9','#9b5de5','#00f5d4'];
    buildGarland(gar1, 'HAPPY', colors);
    buildGarland(gar2, 'BIRTHDAY', colors.slice().reverse());
  }

  function puffSmoke(count = 6){
    const tip = getCandleTip();
    for (let i=0;i<count;i++){
      const m = document.createElement('div');
      m.className = 'smoke';
      const delay = i * 110;
      m.style.left = px(tip.x - 6 + (Math.random()*8 - 4));
      m.style.top  = px(tip.y - 8 + (Math.random()*6 - 3));
      m.style.animationDelay = delay+'ms';
      fxLayer.appendChild(m);
      setTimeout(() => m.remove(), 1400 + delay);
    }
  }

  function burstConfetti(n = CONFETTI_COUNT){
    const tip = getCandleTip();
    const colors = ['#ff4f88','#ffd166','#00bbf9','#00f5d4','#9b5de5','#ffffff'];
    for (let i=0;i<n;i++){
      const p = document.createElement('div');
      p.className = 'confetti';
      const w = 6 + Math.random()*6;
      const h = 8 + Math.random()*10;
      const angle = Math.random() * Math.PI * 2;
      const dist  = 60 + Math.random()*140;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * -dist - 40;
      const rot = (Math.random()*360|0) + 'deg';
      const dur = 900 + Math.random()*900;
      p.style.width = px(w);
      p.style.height = px(h);
      p.style.left = px(tip.x - w/2);
      p.style.top  = px(tip.y - h/2);
      p.style.setProperty('--c', colors[i % colors.length]);
      p.style.setProperty('--tx', px(tx));
      p.style.setProperty('--ty', px(ty));
      p.style.setProperty('--rot', rot);
      p.style.setProperty('--dur', dur+'ms');
      fxLayer.appendChild(p);
      setTimeout(() => p.remove(), dur + 120);
    }
    for (let i=0;i<24;i++){
      const s = document.createElement('div');
      s.className = 'spark';
      const angle = Math.random() * Math.PI * 2;
      const dist  = 20 + Math.random()*60;
      s.style.left = px(tip.x - 5);
      s.style.top  = px(tip.y - 5);
      s.style.setProperty('--tx', px(Math.cos(angle)*dist));
      s.style.setProperty('--ty', px(Math.sin(angle)*-dist - 10));
      const dur = 600 + Math.random()*500;
      s.style.animationDuration = dur+'ms';
      fxLayer.appendChild(s);
      setTimeout(() => s.remove(), dur + 60);
    }
  }

  function releaseBalloons(count = BALLOON_COUNT){
    return new Promise(resolve => {
      const colors = ['var(--pink)','var(--yellow)','var(--blue)','var(--green)','var(--violet)'];
      let finished = 0;
      for (let i=0;i<count;i++){
        const b = document.createElement('div');
        b.className = 'balloon';
        const size  = 34 + Math.random()*18;
        const durBase = 7.5 + Math.random()*3.5;
        const driftBase = 2.2 + Math.random()*1.6;
        const dur   = durBase / BALLOON_SPEED;
        const drift = driftBase / BALLOON_SPEED;
        const left  = 5 + Math.random()*90;
        b.style.setProperty('--size', `${size}px`);
        b.style.setProperty('--dur', `${dur}s`);
        b.style.setProperty('--drift', `${drift}s`);
        b.style.setProperty('--color', colors[i % colors.length]);
        b.style.left = `${left}%`;
        fxLayer.appendChild(b);
        b.addEventListener('animationend', (e) => {
          if (e.animationName === 'rise') {
            finished++;
            if (finished === count) resolve();
          }
        });
        setTimeout(() => b.remove(), (dur+0.7)*1000);
      }
    });
  }

  function showMessage(){ msgBox.classList.add('show'); }
  function hideMessage(){ msgBox.classList.remove('show'); }

  async function blowCandle(){
    if (blown) return;
    blown = true;
    flame.classList.add('out');
    puffSmoke(6);
    burstConfetti(CONFETTI_COUNT);
    await releaseBalloons(BALLOON_COUNT);
    showMessage();
    blowBtn.textContent = 'Light candle 🔥';
  }

  function relightCandle(){
    if (!blown) return;
    blown = false;
    flame.classList.remove('out');
    hideMessage();
    clearFX();
    blowBtn.textContent = 'Blow candle 🌬️';
  }

  function startCake(){
    dropping = true;
    cancelAnimationFrame(rafId);
    const groundY = computeGroundY();
    let y = -220;
    let v = 0;
    const frame = () => {
      v += g; y += v;
      const restTop = parseFloat(cake.style.top);
      if ((restTop + y) >= (groundY - cake.clientHeight)) {
        y = (groundY - cake.clientHeight) - restTop;
        v = -v * restitution;
        body.classList.remove('squish'); void body.offsetWidth; body.classList.add('squish');
        candle.classList.remove('wobble'); void candle.offsetWidth; candle.classList.add('wobble');
        if (Math.abs(v) < 0.7) { v = 0; y = 0; }
      }
      cake.style.transform = `translateX(-50%) translateY(${px(y)})`;
      if (y !== 0 || v !== 0) rafId = requestAnimationFrame(frame); else dropping = false;
    };
    frame();
  }

  function start(){
    relightCandle();
    placeCakeOnGround();
    initGarlands();
    cake.style.transform = 'translateX(-50%) translateY(-220px)';
    setTimeout(startCake, 150);
  }

  window.addEventListener('resize', () => { placeCakeOnGround(); initGarlands(); });
  replay.addEventListener('click', () => { if (!dropping) start(); });
  blowBtn.addEventListener('click', () => blown ? relightCandle() : blowCandle());
  /* add below your existing script, before start() call if possible */
(() => {
  const msgBox = document.getElementById('hbMessage');
  const candle = document.getElementById('candle');
  const stage  = document.getElementById('cakeStage');

  function getCandleTip(){
    const c = candle.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    return { x:(c.left - s.left) + c.width/2, y:(c.top - s.top) + 6 };
  }

  function pinMessage(){
    const tip = getCandleTip();
    msgBox.style.left = tip.x + 'px';
    msgBox.style.top  = tip.y + 'px';
    requestAnimationFrame(pinMessage);
  }

  pinMessage();
})();

  start();
})();