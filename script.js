/**
 * script.js — Happy Birthday Chaile ✨ UPGRADED
 * 49 photo planets | 5 orbital rings | confetti | sparkle trail | shooting stars
 */
'use strict';

const APP = {
  phase: 'intro', renderer: null, introScene: null, galaxyScene: null,
  camera: null, clock: new THREE.Clock(), animFrameId: null,
  starPoints: null, starVelocity: 0.8,
  galaxyGroup: null, photoSpheres: [], raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(), autoOrbitAngle: 0, isFocused: false,
  focusTarget: null, cameraHome: { x: 0, y: 35, z: 110 },
  shootingStars: [], visitedPlanets: new Set(),
  confettiPieces: [], sparkleTrail: [], heartNebula: null,
  isMobile: window.innerWidth <= 768,
  // Manual rotation controls
  isDragging: false, dragStartX: 0, dragStartY: 0, dragVelocityX: 0, dragVelocityY: 0,
  manualRotationX: 0, manualRotationY: 0, momentumX: 0, momentumY: 0,
  isMouseDown: false, // Track if mouse button is currently held
};

const DOM = {
  introScreen:     document.getElementById('intro-screen'),
  countdownScreen: document.getElementById('countdown-screen'),
  greetingScreen:  document.getElementById('greeting-screen'),
  galaxyScreen:    document.getElementById('galaxy-screen'),
  countdownDigit:  document.getElementById('countdown-number'),
  greetingWords:   document.querySelectorAll('.greeting-title .word'),
  galaxyHint:      document.getElementById('galaxy-hint'),
  photoPanel:      document.getElementById('photo-panel'),
  photoImage:      document.getElementById('photo-image'),
  photoCaption:    document.getElementById('photo-caption'),
  startBtn:        document.getElementById('start-btn'),
  enterGalaxyBtn:  document.getElementById('enter-galaxy-btn'),
  closePanelBtn:   document.getElementById('close-panel-btn'),
  backBtn:         document.getElementById('back-btn'),
  galaxyCanvas:    document.getElementById('galaxy-canvas'),
  petalCanvas:     document.getElementById('petal-canvas'),
  galaxyMusic:     null, // Will be created dynamically
};

// Create audio element dynamically
function initAudio() {
  if (!DOM.galaxyMusic) {
    const audio = new Audio();
    audio.id = 'galaxy-music';
    audio.loop = true;
    audio.volume = 0.5;
    audio.src = 'bgmusic/galaxy-music.m4a';
    
    // Add event listeners for debugging
    audio.addEventListener('canplay', () => {
      console.log('✓ Audio can play');
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', audio.error?.message || 'Unknown error');
    });
    
    audio.addEventListener('loadstart', () => console.log('Audio loading...'));
    audio.addEventListener('playing', () => console.log('✓ Audio is now playing!'));
    
    document.body.appendChild(audio);
    DOM.galaxyMusic = audio;
    console.log('Audio element created:', audio.src);
  }
}

const PHOTO_CAPTIONS = [
  // Ring 1 - Hot Pink (intimate, joyful moments)
  'That smile could light up galaxies ✨','Your joy is contagious 🌸','Genuinely radiant 💫','The kind of beauty that stops you',
  'Effortlessly gorgeous 🌹','Caught in pure happiness 😄','You shine so bright 🌟','Simply iconic 👑',
  
  // Ring 2 - Gold (confident, timeless looks)
  'Confidence looks good on you 💖','This is what happy looks like 🌞','Absolutely stunning 🏆','The vibe? Immaculate 🌙',
  'Main character energy, no question 🎬','Soft, golden, unforgettable 🌼','Luminous from within 💎','Photography gold 📸',
  'Cool, calm, and beautiful 🌊','Pure magic in a frame ✨','Forever and always 😍',
  
  // Ring 3 - Sky Blue (dreamy, candid, natural beauty)
  'Dreaming in color 🌫️','Caught in the moment 🎉','Effortlessly you 🦋','A masterpiece 🖼️',
  'The definition of natural beauty 🌿','Bright as ever 🔥','Precious beyond measure 🧸','Golden hour personified 🌅',
  'Timeless beauty 🕰️','This energy? Pure gold ✨','Just breathtaking 🤩',
  
  // Ring 4 - Purple (artistic, soulful, thoughtful)
  'Soul in every glance 💝','The smile that melts hearts 😁','Full of life and light 🌺','Absolutely enchanting 💫',
  'Your grace is undeniable ⭐','That glow though... 🌷','Living your best chapter 🎊','Simply stunning 🎭',
  'My favorite person, every time 📷','The universe in your eyes 🪐','Chaile magic right here 🌸',
  
  // Ring 5 - Teal (playful, spirited, adventurous)
  'Adventure looks amazing on you 🦄','Unbothered and beautiful 👑','That laugh is everything 😄','Glowing from within 🌟',
  'You\'re the real treasure 💎','Wildly, wonderfully you 🌸','Caught smiling at life 😊','Picture perfect ♥',
  'This moment, this you 💖','Forever brilliant 🌞','My universe right here 🪐',
];

// 5 rings × (8+10+11+10+10) = 49 total
const RINGS = [
  { color: 0xff69b4, count: 8,  minR: 28, maxR: 34, inclineRange: 0.15, speedBase: 0.14, sz: 3.8 },
  { color: 0xf5c842, count: 10, minR: 38, maxR: 46, inclineRange: 0.35, speedBase: 0.11, sz: 3.5 },
  { color: 0x4fc3f7, count: 11, minR: 50, maxR: 60, inclineRange: 0.55, speedBase: 0.09, sz: 3.3 },
  { color: 0xb39ddb, count: 10, minR: 64, maxR: 75, inclineRange: 0.70, speedBase: 0.07, sz: 3.0 },
  { color: 0x4db6ac, count: 10, minR: 79, maxR: 92, inclineRange: 0.90, speedBase: 0.055,sz: 2.8 },
];

function randRange(min, max) { return Math.random() * (max - min) + min; }

function showScreen(next) {
  document.querySelectorAll('.screen.active').forEach(el => {
    el.classList.add('exit');
    setTimeout(() => el.classList.remove('active', 'exit'), 900);
  });
  setTimeout(() => next.classList.add('active'), 80);
}

/* ── PHASE 1: STARFIELD ── */
function initRenderer() {
  APP.renderer = new THREE.WebGLRenderer({ canvas: DOM.galaxyCanvas, antialias: true, alpha: true });
  APP.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  APP.renderer.setSize(window.innerWidth, window.innerHeight);
  APP.renderer.setClearColor(0x07050f, 1);
  APP.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  APP.renderer.toneMappingExposure = 0.8; // Reduced from 1.2 to not wash out textures
}
function initCamera() {
  APP.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
  APP.camera.position.set(0,0,0);
}
function buildStarfield() {
  const N=3000, R=80, D=400, pos=new Float32Array(N*3), col=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const i3=i*3, t=Math.random();
    pos[i3]=randRange(-R,R); pos[i3+1]=randRange(-R,R); pos[i3+2]=randRange(-D,10);
    col[i3]=0.85+t*0.15; col[i3+1]=0.85+t*0.10; col[i3+2]=0.90+t*0.10;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  APP.starPoints=new THREE.Points(geo,new THREE.PointsMaterial({size:0.55,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:0.95}));
  APP.introScene=new THREE.Scene();
  APP.introScene.add(APP.starPoints);
}
function animateStarfield() {
  const p=APP.starPoints.geometry.attributes.position.array, spd=APP.starVelocity;
  for(let i=0;i<p.length;i+=3){ p[i+2]+=spd; if(p[i+2]>10)p[i+2]=-380; }
  APP.starPoints.geometry.attributes.position.needsUpdate=true;
}

/* ── PHASE 2: COUNTDOWN ── */
function runCountdown() {
  let count=3;
  function showDigit(n){ DOM.countdownDigit.textContent=n; DOM.countdownDigit.style.animation='none'; void DOM.countdownDigit.offsetWidth; DOM.countdownDigit.style.animation=''; }
  gsap.to(APP,{starVelocity:0.1,duration:2.5,ease:'power2.out'});
  showDigit(3);
  const iv=setInterval(()=>{ count--; if(count>0)showDigit(count); else{clearInterval(iv);transitionToGreeting();} },1000);
}

/* ── PHASE 3: GREETING ── */
function transitionToGreeting() {
  showScreen(DOM.greetingScreen);
  APP.phase='greeting';
  DOM.greetingWords.forEach((w,i)=>setTimeout(()=>w.classList.add('visible'),600+i*220));
  
  // Initialize beautiful flower bouquet animations
  setTimeout(()=>{
    if(typeof FlowerBouquetAnimator !== 'undefined') {
      APP.flowerAnimator = new FlowerBouquetAnimator('flower-canvas');
    }
  }, 100);
  
  setTimeout(()=>{ startPetalSystem(); spawnConfettiBurst(); initSparkleTrail(); }, 1200);
}

/* PETALS */
let petalCtx=null, petals=[], petalAnimId=null;
function createPetal() {
  return { x:randRange(0,window.innerWidth), y:randRange(-120,-20), vx:randRange(-0.6,0.6), vy:randRange(1.2,2.8),
    rotation:randRange(0,Math.PI*2), rotSpeed:randRange(-0.04,0.04), swayPhase:randRange(0,Math.PI*2),
    swayAmp:randRange(0.4,1.4), swayFreq:randRange(0.012,0.025), size:randRange(10,20),
    hue:randRange(330,360), saturation:randRange(65,90), lightness:randRange(65,82), opacity:randRange(0.55,0.85) };
}
function drawPetal(ctx,p) {
  ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation);
  ctx.beginPath();
  ctx.moveTo(0,-p.size*.5);
  ctx.bezierCurveTo(p.size*.55,-p.size*.4,p.size*.55,p.size*.4,0,p.size*.5);
  ctx.bezierCurveTo(-p.size*.55,p.size*.4,-p.size*.55,-p.size*.4,0,-p.size*.5);
  ctx.closePath();
  const g=ctx.createRadialGradient(0,-p.size*.15,0,0,0,p.size*.55);
  g.addColorStop(0,`hsla(${p.hue},${p.saturation+10}%,${p.lightness+12}%,${p.opacity})`);
  g.addColorStop(1,`hsla(${p.hue-15},${p.saturation}%,${p.lightness-8}%,${p.opacity*.6})`);
  ctx.fillStyle=g; ctx.strokeStyle=`hsla(${p.hue},60%,80%,.2)`; ctx.lineWidth=.5;
  ctx.fill(); ctx.stroke(); ctx.restore();
}
function tickPetals() {
  petalAnimId=requestAnimationFrame(tickPetals);
  petalCtx.clearRect(0,0,DOM.petalCanvas.width,DOM.petalCanvas.height);
  for(const p of petals){
    p.swayPhase+=p.swayFreq; p.x+=p.vx+Math.sin(p.swayPhase)*p.swayAmp; p.y+=p.vy; p.rotation+=p.rotSpeed;
    if(p.y>window.innerHeight+30){ p.x=randRange(0,window.innerWidth); p.y=randRange(-60,-10); p.swayPhase=randRange(0,Math.PI*2); }
    drawPetal(petalCtx,p);
  }
  drawConfetti(); drawSparkles();
}
function startPetalSystem() {
  DOM.petalCanvas.width=window.innerWidth; DOM.petalCanvas.height=window.innerHeight;
  petalCtx=DOM.petalCanvas.getContext('2d');
  petals=Array.from({length:60},createPetal);
  petals.forEach(p=>{ if(Math.random()>.5)p.y=randRange(0,window.innerHeight); });
  tickPetals();
}
function stopPetalSystem() { if(petalAnimId){cancelAnimationFrame(petalAnimId);petalAnimId=null;} }

/* 🎉 CONFETTI */
function createConfetti(x,y) {
  const cols=['#ff69b4','#f5c842','#4fc3f7','#b39ddb','#4db6ac','#ff8dc7','#ffe880'];
  return { x,y, vx:randRange(-7,7), vy:randRange(-13,-3), gravity:.3,
    rotation:randRange(0,Math.PI*2), rotSpeed:randRange(-.12,.12),
    w:randRange(6,14), h:randRange(4,8), color:cols[Math.floor(Math.random()*cols.length)], opacity:1, decay:randRange(.012,.025) };
}
function spawnConfettiBurst() {
  const cx=window.innerWidth/2, cy=window.innerHeight*.3;
  for(let i=0;i<90;i++) APP.confettiPieces.push(createConfetti(cx+randRange(-80,80),cy+randRange(-40,40)));
}
function drawConfetti() {
  if(!petalCtx) return;
  APP.confettiPieces=APP.confettiPieces.filter(c=>c.opacity>0);
  for(const c of APP.confettiPieces){
    c.vy+=c.gravity; c.x+=c.vx; c.y+=c.vy; c.rotation+=c.rotSpeed; c.opacity-=c.decay;
    petalCtx.save(); petalCtx.globalAlpha=Math.max(0,c.opacity);
    petalCtx.translate(c.x,c.y); petalCtx.rotate(c.rotation);
    petalCtx.fillStyle=c.color; petalCtx.fillRect(-c.w/2,-c.h/2,c.w,c.h);
    petalCtx.restore();
  }
}

/* ✨ SPARKLE TRAIL */
const SPARKLES=['✨','🌸','💖','⭐','🌟','💫','🎀','🦋'];
function initSparkleTrail() { /* uses petalCtx shared canvas */ }
function addSparkle(x,y) {
  APP.sparkleTrail.push({ x,y, emoji:SPARKLES[Math.floor(Math.random()*SPARKLES.length)],
    size:randRange(14,26), vy:randRange(-2,-.5), vx:randRange(-1,1), opacity:1, decay:randRange(.03,.06) });
  if(APP.sparkleTrail.length>50) APP.sparkleTrail.shift();
}
function drawSparkles() {
  if(!petalCtx) return;
  APP.sparkleTrail=APP.sparkleTrail.filter(s=>s.opacity>0);
  for(const s of APP.sparkleTrail){
    s.x+=s.vx; s.y+=s.vy; s.opacity-=s.decay;
    petalCtx.save(); petalCtx.globalAlpha=Math.max(0,s.opacity);
    petalCtx.font=`${s.size}px serif`; petalCtx.textAlign='center';
    petalCtx.fillText(s.emoji,s.x,s.y); petalCtx.restore();
  }
}

/* ── PHASE 4: GALAXY ── */
function buildGalaxy() {
  APP.galaxyScene=new THREE.Scene();
  APP.galaxyGroup=new THREE.Group();
  APP.galaxyScene.add(APP.galaxyGroup);
  // Enhanced lighting for better texture visibility
  APP.galaxyScene.add(new THREE.AmbientLight(0xffeeff,.45));
  const fl=new THREE.DirectionalLight(0xffd6e0,.8); fl.position.set(20,50,30); APP.galaxyScene.add(fl);
  const fl2=new THREE.DirectionalLight(0xe0d6ff,.4); fl2.position.set(-20,-30,-40); APP.galaxyScene.add(fl2);
  buildSpiralArms(); buildHeartNebula(); buildBackgroundStars(); buildPhotoSpheres(); initShootingStars();
}

function buildSpiralArms() {
  const N=8000, ARMS=2, SPR=4, HH=1.5, OR=95, ap=[], ac=[];
  for(let arm=0;arm<ARMS;arm++){
    const ao=(Math.PI*2/ARMS)*arm;
    for(let i=0;i<N;i++){
      const t=i/N, ang=t*Math.PI*5+ao, r=t*OR;
      ap.push(Math.cos(ang)*r+randRange(-SPR,SPR)*(1-t*.5), randRange(-HH,HH), Math.sin(ang)*r+randRange(-SPR,SPR)*(1-t*.5));
      const w=1-t; ac.push(.55+w*.45,.10+w*.15,.55+(1-w)*.45);
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(ap),3));
  g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(ac),3));
  APP.galaxyGroup.add(new THREE.Points(g,new THREE.PointsMaterial({size:.3,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.75,depthWrite:false})));
}

function buildHeartNebula() {
  const N=6000,SC=2.0,ND=3.0,pos=new Float32Array(N*3),col=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const t=(i/N)*Math.PI*2,sc=randRange(0,1.6),i3=i*3;
    const hx=16*Math.pow(Math.sin(t),3),hy=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
    pos[i3]=hx*SC+randRange(-sc,sc); pos[i3+1]=hy*SC+randRange(-sc,sc); pos[i3+2]=randRange(-ND,ND);
    const c=Math.abs(Math.sin(t*2.5))*.6+.3;
    col[i3]=.9+c*.1; col[i3+1]=.1+c*.3; col[i3+2]=.4+c*.4;
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const hp=new THREE.Points(g,new THREE.PointsMaterial({size:.35,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}));
  APP.galaxyGroup.add(hp); APP.heartNebula=hp;
}

function buildBackgroundStars() {
  const N=2000,pos=new Float32Array(N*3),col=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const i3=i*3,th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),r=randRange(120,260);
    pos[i3]=r*Math.sin(ph)*Math.cos(th); pos[i3+1]=r*Math.sin(ph)*Math.sin(th); pos[i3+2]=r*Math.cos(ph);
    const b=.7+Math.random()*.3; col[i3]=b; col[i3+1]=b; col[i3+2]=b;
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  APP.galaxyScene.add(new THREE.Points(g,new THREE.PointsMaterial({size:.4,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.6,depthWrite:false})));
}

function buildPhotoSpheres() {
  const loader=new THREE.TextureLoader();
  // Set a crossOrigin to handle CORS if needed
  loader.setCrossOrigin('anonymous');
  
  console.log('🌟 Starting to build photo spheres...');
  let gi=0;
  let loadedCount=0;
  let failedCount=0;
  
  RINGS.forEach((ring,ri)=>{
    for(let j=0;j<ring.count;j++){
      const pn=gi+1;
      // Use img/chaile${pn}.jpg without ./ prefix for better path resolution
      const imageName=`img/chaile${pn}.jpg`;
      
      // Use PlaneGeometry for flat image cards instead of spheres
      const w = ring.sz * 2.2;
      const h = ring.sz * 2.8;
      const geo=new THREE.PlaneGeometry(w,h);
      
      // Use MeshBasicMaterial which always shows the texture with no lighting needed
      const mat=new THREE.MeshBasicMaterial({
        color:0xffffff,
        map:null,
        side:THREE.FrontSide,
        transparent:true,
        opacity:1.0
      });
      
      // Load and apply texture asynchronously
      loader.load(imageName,
        (tex)=>{
          loadedCount++;
          console.log(`✓ Texture loaded [${loadedCount}/${49}] ${imageName}`);
          tex.colorSpace=THREE.SRGBColorSpace;
          tex.magFilter=THREE.LinearFilter;
          tex.minFilter=THREE.LinearMipmapLinearFilter;
          // Apply texture to material
          mat.map=tex;
          mat.needsUpdate=true;
        },
        (progress)=>{
          if(progress.total > 0) {
            const pct=(progress.loaded/progress.total*100).toFixed(1);
            console.log(`⏳ Loading ${imageName}: ${pct}%`);
          }
        },
        (err)=>{
          failedCount++;
          console.error(`✗ Failed to load [${failedCount}] ${imageName}:`, err);
          // Fallback: create a colorful placeholder
          const c=new THREE.Color();
          c.setHSL(ri/RINGS.length+Math.random()*0.1,.8,.55);
          mat.color.copy(c);
          mat.needsUpdate=true;
        }
      );
      
      const plane=new THREE.Mesh(geo,mat);
      const orR=randRange(ring.minR,ring.maxR), spd=ring.speedBase+randRange(-.01,.01);
      const inc=randRange(-ring.inclineRange,ring.inclineRange);
      const ang=(j/ring.count)*Math.PI*2+randRange(-.2,.2);
      plane.userData={ orbitRadius:orR, orbitSpeed:spd, inclination:inc,
        angle:ang, bobAmp:1+Math.random()*1.0, bobPhase:Math.random()*Math.PI*2,
        caption:PHOTO_CAPTIONS[gi]||`Chaile #${pn} ♥`, index:gi, ringColor:ring.color, imagePath:imageName };
      
      // Glowing border effect
      const borderGeo=new THREE.PlaneGeometry(w+0.4,h+0.4);
      const borderMat=new THREE.MeshBasicMaterial({color:ring.color,side:THREE.BackSide,transparent:true,opacity:.5});
      const border=new THREE.Mesh(borderGeo,borderMat);
      border.position.z=-0.01;
      plane.add(border);
      plane.userData.border=border;
      
      APP.galaxyGroup.add(plane); APP.photoSpheres.push(plane);
      gi++;
    }
  });
  console.log('🌟 Photo spheres building complete. Textures loading asynchronously...');
}

function updateSphereOrbits(t) {
  APP.photoSpheres.forEach(s=>{
    const d=s.userData;
    d.angle+=d.orbitSpeed*.007;
    const ci=Math.cos(d.inclination), si=Math.sin(d.inclination);
    const bx=Math.cos(d.angle)*d.orbitRadius, bz=Math.sin(d.angle)*d.orbitRadius;
    s.position.x=bx*ci; s.position.z=bz;
    s.position.y=bx*si+Math.sin(t*.5+d.bobPhase)*d.bobAmp;
    
    // Billboard effect - always face camera
    s.lookAt(APP.camera.position);
    
    if(d.border) d.border.material.opacity=.3+Math.sin(t*1.5+d.bobPhase)*.2;
  });
}

/* 🌠 SHOOTING STARS */
function initShootingStars() { setInterval(spawnShootingStar,2800); }
function spawnShootingStar() {
  if(APP.phase!=='galaxy') return;
  const th=Math.random()*Math.PI*2,ph=(Math.random()-.5)*1.0,r=105;
  const s=new THREE.Vector3(r*Math.cos(th)*Math.cos(ph),r*Math.sin(ph),r*Math.sin(th)*Math.cos(ph));
  const e=s.clone().multiplyScalar(-.55);
  const g=new THREE.BufferGeometry().setFromPoints([s,e]);
  const m=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.9});
  const ln=new THREE.Line(g,m);
  APP.galaxyScene.add(ln); APP.shootingStars.push({line:ln,age:0,maxAge:55});
}
function updateShootingStars() {
  for(let i=APP.shootingStars.length-1;i>=0;i--){
    const s=APP.shootingStars[i]; s.age++;
    s.line.material.opacity=Math.max(0,.9*(1-s.age/s.maxAge));
    if(s.age>=s.maxAge){ APP.galaxyScene.remove(s.line); APP.shootingStars.splice(i,1); }
  }
}

function updateHeartNebula(t) { if(APP.heartNebula)APP.heartNebula.scale.setScalar(1+Math.sin(t*.6)*.04); }

function updateManualRotation() {
  // Apply momentum decay
  if(Math.abs(APP.momentumX) > 0.0001) {
    APP.manualRotationY += APP.momentumX;
    APP.momentumX *= 0.94; // Friction
  }
  if(Math.abs(APP.momentumY) > 0.0001) {
    APP.manualRotationX += APP.momentumY;
    APP.momentumY *= 0.94; // Friction
  }
  
  // Apply manual rotations to camera position
  if(Math.abs(APP.manualRotationX) > 0.0001 || Math.abs(APP.manualRotationY) > 0.0001) {
    const r = 115;
    const baseAngle = APP.autoOrbitAngle + APP.manualRotationY;
    const inclination = APP.manualRotationX;
    
    const x = Math.cos(baseAngle) * r * Math.cos(inclination);
    const z = Math.sin(baseAngle) * r * Math.cos(inclination);
    const y = 33 + Math.sin(APP.clock.getElapsedTime() * 0.2) * 8 + r * Math.sin(inclination);
    
    APP.camera.position.x = x;
    APP.camera.position.z = z;
    APP.camera.position.y = y;
    APP.camera.lookAt(0, 0, 0);
  }
}

function updateAutoOrbit(t) {
  // Skip auto-orbit if dragging, focused, or if there's still momentum
  if(APP.isFocused || APP.isDragging || Math.abs(APP.momentumX) > 0.0001 || Math.abs(APP.momentumY) > 0.0001) return;
  
  APP.autoOrbitAngle+=.0007;
  const R=115, tx=Math.cos(APP.autoOrbitAngle)*R, tz=Math.sin(APP.autoOrbitAngle)*R, ty=33+Math.sin(t*.2)*8;
  APP.camera.position.x+=(tx-APP.camera.position.x)*.007;
  APP.camera.position.z+=(tz-APP.camera.position.z)*.007;
  APP.camera.position.y+=(ty-APP.camera.position.y)*.005;
  APP.camera.lookAt(0,0,0);
}

/* RAYCASTER */
function onGalaxyClick(e) {
  if(APP.phase!=='galaxy') return;
  // Don't process clicks if the photo panel is open or if clicking on UI elements
  if(APP.isFocused) return;
  if(e.target !== DOM.galaxyCanvas) return;
  
  APP.mouse.x=(e.clientX/window.innerWidth)*2-1;
  APP.mouse.y=-(e.clientY/window.innerHeight)*2+1;
  APP.raycaster.setFromCamera(APP.mouse,APP.camera);
  const hits=APP.raycaster.intersectObjects(APP.photoSpheres,false);
  if(hits.length>0) focusSphere(hits[0].object);
}
function focusSphere(sphere) {
  APP.isFocused=true; APP.focusTarget=sphere;
  APP.visitedPlanets.add(sphere.userData.index);
  const dir=sphere.position.clone().normalize();
  const cp=sphere.position.clone().add(dir.multiplyScalar(14));
  gsap.to(APP.camera.position,{ x:cp.x,y:cp.y,z:cp.z,duration:2.2,ease:'expo.inOut',
    onUpdate:()=>APP.camera.lookAt(sphere.position),
    onComplete:()=>{ 
      DOM.photoImage.src=sphere.userData.imagePath;
      DOM.photoCaption.textContent=sphere.userData.caption;
      DOM.photoPanel.setAttribute('aria-hidden','false'); 
      DOM.photoPanel.classList.add('open');
      updateVisitCounter(); 
    }
  });
}
function defocusSphere() {
  if(!APP.isFocused) return;
  DOM.photoPanel.classList.remove('open'); DOM.photoPanel.setAttribute('aria-hidden','true');
  gsap.to(APP.camera.position,{ x:APP.cameraHome.x,y:APP.cameraHome.y,z:APP.cameraHome.z,
    duration:2.0,ease:'expo.inOut', onUpdate:()=>APP.camera.lookAt(0,0,0),
    onComplete:()=>{ APP.isFocused=false; APP.focusTarget=null; }
  });
}

function updateVisitCounter() {
  const el=document.getElementById('visit-counter'); if(!el) return;
  const n=APP.visitedPlanets.size;
  el.textContent = n>=49 ? '🎉 All 49 planets! You\'re a whole universe, Chaile! 🌌'
    : n===1 ? '⭐ 1 planet visited — keep exploring!'
    : `✨ ${n} of 49 planets visited!`;
  el.classList.add('pop'); setTimeout(()=>el.classList.remove('pop'),600);
}

/* RENDER LOOP */
function renderLoop() {
  APP.animFrameId=requestAnimationFrame(renderLoop);
  const t=APP.clock.getElapsedTime();
  if(APP.phase==='intro'||APP.phase==='countdown'){
    animateStarfield(); APP.renderer.render(APP.introScene,APP.camera);
  } else if(APP.phase==='galaxy'){
    updateSphereOrbits(t); updateHeartNebula(t); updateManualRotation(); updateAutoOrbit(t);
    updateShootingStars(); APP.renderer.render(APP.galaxyScene,APP.camera);
  }
}

function transitionToGalaxy() {
  stopPetalSystem();
  if(!APP.galaxyScene) buildGalaxy();
  // Adjust camera position for mobile devices
  if(APP.isMobile) {
    APP.cameraHome = { x: 0, y: 45, z: 130 };
  }
  APP.camera.position.set(APP.cameraHome.x,APP.cameraHome.y,APP.cameraHome.z);
  APP.camera.lookAt(0,0,0);
  showScreen(DOM.galaxyScreen); APP.phase='galaxy';
  setTimeout(()=>DOM.galaxyHint.classList.add('hidden'),5000);
  
  // Initialize and play background music
  initAudio();
  if(DOM.galaxyMusic) {
    console.log('Attempting to play music...');
    DOM.galaxyMusic.currentTime = 0;
    
    // Ensure audio is unmuted
    DOM.galaxyMusic.muted = false;
    
    // Try multiple times to play (some browsers need a delay)
    const attemptPlay = () => {
      const playPromise = DOM.galaxyMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✓ Music started playing!');
          })
          .catch(err => {
            console.log('Play attempt failed:', err.message);
            // Retry after user interaction
            setTimeout(() => {
              console.log('Retrying play...');
              DOM.galaxyMusic.play().catch(e => console.log('Final retry failed:', e));
            }, 500);
          });
      }
    };
    
    // Wait for audio to be ready
    if (DOM.galaxyMusic.readyState >= 2) {
      attemptPlay();
    } else {
      DOM.galaxyMusic.addEventListener('canplay', attemptPlay, { once: true });
    }
  }
}

function onResize() {
  const w=window.innerWidth,h=window.innerHeight;
  APP.isMobile = w <= 768;
  APP.camera.aspect=w/h; APP.camera.updateProjectionMatrix(); APP.renderer.setSize(w,h);
  if(petalCtx){ DOM.petalCanvas.width=w; DOM.petalCanvas.height=h; }
}

/* EVENTS */
DOM.startBtn.addEventListener('click',()=>{ showScreen(DOM.countdownScreen); APP.phase='countdown'; setTimeout(runCountdown,400); });
DOM.enterGalaxyBtn.addEventListener('click',(e)=>{ e.preventDefault(); e.stopPropagation(); transitionToGalaxy(); });
DOM.backBtn.addEventListener('click',()=>{ defocusSphere(); showScreen(DOM.greetingScreen); APP.phase='greeting'; startPetalSystem(); spawnConfettiBurst(); DOM.galaxyMusic.pause(); });
DOM.closePanelBtn.addEventListener('click',defocusSphere);
DOM.galaxyCanvas.addEventListener('click',onGalaxyClick);

// Galaxy drag rotation controls
function onGalaxyDragStart(e) {
  if(APP.phase !== 'galaxy' || APP.isFocused) return;
  APP.isMouseDown = true; // Button is being held
  APP.dragStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  APP.dragStartY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  APP.dragVelocityX = 0;
  APP.dragVelocityY = 0;
  APP.isDragging = false; // Not dragging yet (need movement threshold)
}

function onGalaxyDragMove(e) {
  // Only rotate if mouse button is actually held down
  if(!APP.isMouseDown || APP.phase !== 'galaxy' || APP.isFocused) return;
  
  const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
  const distX = Math.abs(currentX - APP.dragStartX);
  const distY = Math.abs(currentY - APP.dragStartY);
  
  // Only start dragging if movement exceeds 5px threshold
  if(distX > 5 || distY > 5) {
    APP.isDragging = true;
    const deltaX = (currentX - APP.dragStartX) * 0.01;
    const deltaY = (currentY - APP.dragStartY) * 0.01;
    
    // Update rotation angles
    APP.manualRotationY += deltaX;
    APP.manualRotationX += deltaY;
    
    // Store velocity for momentum
    APP.dragVelocityX = deltaX * 0.5;
    APP.dragVelocityY = deltaY * 0.5;
    
    // Reset start position for continuous dragging
    APP.dragStartX = currentX;
    APP.dragStartY = currentY;
  }
}

function onGalaxyDragEnd(e) {
  APP.isMouseDown = false; // Button released
  if(!APP.isDragging) {
    APP.isDragging = false;
    return;
  }
  APP.isDragging = false;
  // Apply momentum
  APP.momentumX = APP.dragVelocityX * 2;
  APP.momentumY = APP.dragVelocityY * 2;
}

// Mouse events
DOM.galaxyCanvas.addEventListener('mousedown', onGalaxyDragStart);
document.addEventListener('mousemove', onGalaxyDragMove);
document.addEventListener('mouseup', onGalaxyDragEnd);

// Touch events
DOM.galaxyCanvas.addEventListener('touchstart', onGalaxyDragStart, false);
document.addEventListener('touchmove', onGalaxyDragMove, { passive: true });
document.addEventListener('touchend', onGalaxyDragEnd);

window.addEventListener('resize',onResize);
document.addEventListener('mousemove',(e)=>{ if(APP.phase==='greeting'&&Math.random()<.35)addSparkle(e.clientX,e.clientY); });
document.addEventListener('touchmove',(e)=>{ if(APP.phase==='greeting'){const t=e.touches[0];addSparkle(t.clientX,t.clientY);} },{passive:true});

/* BOOT */
(function boot(){
  initRenderer(); initCamera(); buildStarfield(); renderLoop();
  DOM.introScreen.classList.add('active'); APP.phase='intro';
})();
