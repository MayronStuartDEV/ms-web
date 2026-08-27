
/* ============================================================
   MS WEB INTRO
   Port fiel da animação Canvas 2D criada na Lovable.
   Integração em página estática, sem React/TanStack.
   ============================================================ */
(() => {
  "use strict";

  const overlay = document.getElementById("msIntro");
  const canvas = document.getElementById("msIntroCanvas");
  const title = document.getElementById("msIntroTitle");
  const rule = document.getElementById("msIntroRule");

  if (!overlay || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  document.body.classList.add("ms-intro-lock");

  /* Timeline preservada da versão timing-v1 aprovada. */
  const T = {
    darkEnd: 0.4,
    signalStart: 0.4,
    signalEnd: 2.0,
    activation: 2.0,
    activationEnd: 2.9,
    reorgStart: 2.4,
    lettersEnd: 6.9,
    aliveEnd: 9.9,
    textStart: 9.9,
    taglineStart: 10.9,
    done: 11.9
  };

  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
  const easeInOut = (t) =>
    t <= 0 ? 0 :
    t >= 1 ? 1 :
    t < 0.5 ? 4 * t * t * t :
    1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

  const LETTER_M = [
    [
      {x:0,y:1},{x:0,y:0.16},{x:0.14,y:0},{x:0.28,y:0},
      {x:0.5,y:0.44},{x:0.72,y:0},{x:0.86,y:0},{x:1,y:0.16},{x:1,y:1}
    ],
    [{x:0.18,y:1},{x:0.18,y:0.34}],
    [{x:0.82,y:1},{x:0.82,y:0.34}],
    [{x:0.5,y:0.62},{x:0.5,y:1}],
    [{x:0.18,y:0.68},{x:0.32,y:0.68},{x:0.4,y:0.76},{x:0.5,y:0.76}],
    [{x:0.82,y:0.52},{x:0.68,y:0.52},{x:0.6,y:0.44},{x:0.6,y:0.24}]
  ];

  const LETTER_S = [
    [
      {x:1,y:0.14},{x:0.86,y:0},{x:0.16,y:0},{x:0,y:0.16},
      {x:0,y:0.36},{x:0.16,y:0.5},{x:0.84,y:0.5},{x:1,y:0.64},
      {x:1,y:0.86},{x:0.84,y:1},{x:0.12,y:1},{x:0,y:0.88}
    ],
    [{x:0.16,y:0.16},{x:0.86,y:0.16}],
    [{x:0.14,y:0.84},{x:0.84,y:0.84}],
    [{x:0.16,y:0.32},{x:0.3,y:0.32}],
    [{x:0.7,y:0.68},{x:0.84,y:0.68}],
    [{x:0.3,y:0.66},{x:0.44,y:0.66},{x:0.52,y:0.74},{x:0.72,y:0.74}],
    [{x:0.72,y:0.34},{x:0.56,y:0.34},{x:0.48,y:0.26},{x:0.3,y:0.26}]
  ];

  const DIRS = [
    {x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},
    {x:-1,y:0},{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1}
  ];

  const makeRng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  const pathLength = (pts) => {
    let l = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      l += Math.hypot(b.x - a.x, b.y - a.y);
    }
    return l;
  };

  const pointAt = (pts, dist) => {
    let d = dist;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (d <= seg) {
        const t = seg === 0 ? 0 : d / seg;
        return {x:a.x + (b.x-a.x)*t, y:a.y + (b.y-a.y)*t};
      }
      d -= seg;
    }
    return pts[pts.length - 1];
  };

  const growTrace = (rng, start, dirIndex, steps, unit, bounds) => {
    const pts = [{...start}];
    let dir = dirIndex;
    let cur = {...start};
    for (let i=0;i<steps;i++) {
      const r = rng();
      if (r < 0.34) dir = (dir + 1) % 8;
      else if (r < 0.68) dir = (dir + 7) % 8;
      const d = DIRS[dir];
      const len = unit * (1 + Math.floor(rng() * 3));
      const next = {x:cur.x + d.x*len, y:cur.y + d.y*len};
      if (next.x < -unit || next.x > bounds.w + unit || next.y < -unit || next.y > bounds.h + unit) {
        dir = (dir + 4) % 8;
        continue;
      }
      pts.push(next);
      cur = next;
    }
    return pts;
  };

  const strokeOrder = (pts) => {
    let dx=0, dy=0;
    for (let i=1;i<pts.length;i++) {
      dx += Math.abs(pts[i].x-pts[i-1].x);
      dy += Math.abs(pts[i].y-pts[i-1].y);
    }
    if (pts.length > 4) return 1.6;
    if (dy > dx * 1.6) return 0;
    if (dx > dy * 1.6) return 2;
    return 1;
  };

  let w=0,h=0,dpr=1,unit=24;
  let bgTraces=[], netTraces=[], letterTraces=[];
  let signal=[], signalLen=0;
  let center={x:0,y:0};
  const mouse={x:-9999,y:-9999};
  let raf=0, start=0, finished=false, lastTextPhase=-1;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildSignalPath() {
    const y=h*0.5, sx=w*0.17, pts=[{x:sx,y}];
    const dx=center.x-sx;
    pts.push({x:sx+dx*0.2,y});
    pts.push({x:sx+dx*0.3,y:y-unit*2.5});
    pts.push({x:sx+dx*0.5,y:y-unit*2.5});
    pts.push({x:sx+dx*0.6,y:y+unit*1.5});
    pts.push({x:sx+dx*0.8,y:y+unit*1.5});
    pts.push({x:sx+dx*0.9,y});
    pts.push({x:center.x,y});
    return pts;
  }

  function letterTracesFor(strokes, ox, oy, bw, bh, rng, side) {
    return strokes.map((s,i) => {
      const dst=s.map(p=>({x:ox+p.x*bw,y:oy+p.y*bh}));
      const cx=dst.reduce((a,p)=>a+p.x,0)/dst.length;
      const cy=dst.reduce((a,p)=>a+p.y,0)/dst.length;
      const angle=Math.atan2(cy-center.y,cx-center.x)+side*(0.4+rng()*0.6);
      const dist=Math.min(w,h)*(0.24+rng()*0.28);
      const ax=center.x+Math.cos(angle)*dist;
      const ay=center.y+Math.sin(angle)*dist;
      const snap=v=>Math.round(v/(unit*0.5))*(unit*0.5);
      const src=dst.map(p=>({x:snap(ax+(p.x-cx)*0.32),y:snap(ay+(p.y-cy)*0.32)}));
      const order=strokeOrder(s);
      return {
        src,dst,len:pathLength(dst),
        morphStart:T.reorgStart+order*0.78+(i%3)*0.16+rng()*0.4,
        morphDur:1.9+rng()*0.55,
        width:s.length>4?3:1.7,
        order,
        particle:{offset:rng(),speed:0.13+rng()*0.05}
      };
    });
  }

  function build() {
    const rng=makeRng(20260822);
    const small=w<720, medium=w<1100;
    unit=Math.max(14,Math.round(Math.min(w,h)/42));
    center={x:w*0.5,y:h*0.5};

    const bgCount=small?26:medium?34:52;
    bgTraces=[];
    const pushBg=(pts,delay,dur,width)=>bgTraces.push({pts,len:pathLength(pts),delay,dur,width});

    // No celular, reforça a leitura da composição para a esquerda.
    // São trilhas independentes, sem mexer na formação do MS.
    if (small) {
      for (let i=0; i<8; i++) {
        const y=h*(0.12 + i*0.105) + (rng()-0.5)*unit*2;
        const st={x:-unit*(1+rng()*2), y};
        const pts=growTrace(rng,st,0,8+Math.floor(rng()*5),unit,{w,h});
        pushBg(pts,0.55+i*0.22,2.8+rng()*1.2,1.15);
      }
    }
    for(let i=0;i<bgCount;i++){
      const ang=(i/bgCount)*Math.PI*2+rng()*0.4;
      const rad=Math.min(w,h)*(0.32+rng()*0.55);
      const st={
        x:Math.min(w+unit,Math.max(-unit,center.x+Math.cos(ang)*rad*1.25)),
        y:Math.min(h+unit,Math.max(-unit,center.y+Math.sin(ang)*rad))
      };
      const pts=growTrace(rng,st,Math.floor(rng()*8),6+Math.floor(rng()*8),unit,{w,h});
      pushBg(pts,0.35+(i/bgCount)*2.9+rng()*0.6,2.4+rng()*1.8,1);
    }

    const busY=[0.14,0.3,0.72,0.88];
    busY.forEach((fy,i)=>{
      const y=Math.round(h*fy), fromLeft=i%2===0;
      const inner=fromLeft?w*(0.3+rng()*0.1):w*(0.6+rng()*0.1);
      const step=unit*2;
      const pts=fromLeft
        ? [{x:-unit,y},{x:inner-step,y},{x:inner,y:y+(fy<0.5?step:-step)},{x:inner+step*2,y:y+(fy<0.5?step:-step)}]
        : [{x:w+unit,y},{x:inner+step,y},{x:inner,y:y+(fy<0.5?step:-step)},{x:inner-step*2,y:y+(fy<0.5?step:-step)}];
      pushBg(pts,0.5+i*0.55,3.2+rng()*1.1,1.4);
    });

    const busX=[0.1,0.9];
    busX.forEach((fx,i)=>{
      const x=Math.round(w*fx);
      const pts=[{x,y:-unit},{x,y:h*0.34},{x:x+(fx<0.5?unit*2:-unit*2),y:h*0.34+unit*2},{x:x+(fx<0.5?unit*2:-unit*2),y:h*0.7},{x,y:h*0.7+unit*2},{x,y:h+unit}];
      pushBg(pts,0.9+i*0.5,3.4+rng()*0.9,1.4);
    });

    const netCount=small?12:medium?20:30;
    netTraces=[];
    for(let i=0;i<netCount;i++){
      const dirIndex=i%8, off=unit*(1+(i%3));
      const st={x:center.x+Math.cos(dirIndex/8*Math.PI*2)*off,y:center.y+Math.sin(dirIndex/8*Math.PI*2)*off};
      const pts=growTrace(rng,st,dirIndex,10+Math.floor(rng()*9),unit,{w,h});
      netTraces.push({pts,len:pathLength(pts),delay:T.activation+0.05+(i/netCount)*2.8+(i%4)*0.1,dur:2.1+rng()*1.3,width:1.3,particle:{offset:rng(),speed:0.1+rng()*0.12}});
    }

    // No celular, o MS precisa ocupar mais presença visual.
    const boxH=small
      ? Math.min(h*0.38,w*0.28)
      : Math.min(h*0.3,w*0.16);
    const boxW=boxH*0.92, gap=boxH*0.24, totalW=boxW*2+gap;
    const ox=center.x-totalW/2, oy=center.y-boxH/2;
    letterTraces=[
      ...letterTracesFor(LETTER_M,ox,oy,boxW,boxH,rng,-1),
      ...letterTracesFor(LETTER_S,ox+boxW+gap,oy,boxW,boxH,rng,1)
    ];
    signal=buildSignalPath();
    signalLen=pathLength(signal);
  }

  function resize() {
    dpr=Math.min(window.devicePixelRatio||1,2);
    w=canvas.clientWidth; h=canvas.clientHeight;
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    build();
  }

  function strokePath(pts,upTo,width,color,alpha,glow) {
    if(upTo<=0 || alpha<=0.002) return;
    ctx.save(); ctx.globalAlpha=alpha; ctx.strokeStyle=color; ctx.lineWidth=width;
    ctx.lineJoin="miter"; ctx.lineCap="round";
    if(glow>0){ctx.shadowColor=color;ctx.shadowBlur=glow;}
    ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
    let remaining=upTo;
    for(let i=1;i<pts.length&&remaining>0;i++){
      const a=pts[i-1], b=pts[i], seg=Math.hypot(b.x-a.x,b.y-a.y);
      if(seg<=remaining){ctx.lineTo(b.x,b.y);remaining-=seg;}
      else{const tt=remaining/seg;ctx.lineTo(a.x+(b.x-a.x)*tt,a.y+(b.y-a.y)*tt);remaining=0;}
    }
    ctx.stroke(); ctx.restore();
  }

  function node(p,r,alpha,glow,color="#7fd0ff"){
    if(alpha<=0.01)return;
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=glow;
    ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function energyPoint(p,scale,alpha){
    ctx.save();ctx.globalCompositeOperation="lighter";
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,46*scale);
    g.addColorStop(0,`rgba(255,255,255,${0.95*alpha})`);
    g.addColorStop(0.12,`rgba(190,232,255,${0.8*alpha})`);
    g.addColorStop(0.35,`rgba(39,167,255,${0.35*alpha})`);
    g.addColorStop(1,"rgba(22,139,255,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,46*scale,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function ring(p,radius,alpha,width){
    if(alpha<=0.01)return;
    ctx.save();ctx.globalCompositeOperation="lighter";ctx.globalAlpha=alpha;
    ctx.strokeStyle="#27a7ff";ctx.lineWidth=width;ctx.shadowColor="#27a7ff";ctx.shadowBlur=18;
    ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.stroke();ctx.restore();
  }

  let interactive=false;
  const mouseBoost=(p)=>{
    if(!interactive)return 0;
    const d=Math.hypot(p.x-mouse.x,p.y-mouse.y), R=150;
    return d>R?0:(1-d/R)*(1-d/R);
  };

  function setPhaseText(tp){
    title.classList.toggle("is-visible",tp>=1);
    rule.classList.toggle("is-visible",tp>=2);
  }

  function complete(){
    if(finished)return;
    finished=true;
    document.body.classList.remove("ms-intro-lock");
    overlay.classList.add("is-done");
  }

  function frame(now){
    if(!start)start=now;
    let t=(now-start)/1000;
    if(reduced)t=Math.min(t*2.2+T.reorgStart,T.done+2);
    interactive=t>T.aliveEnd;

    ctx.fillStyle="#020308";ctx.fillRect(0,0,w,h);
    const coreLife=clamp01((t-T.activation)/1.2);
    const atm=ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,Math.max(w,h)*0.7);
    atm.addColorStop(0,`rgba(10,42,86,${0.05+coreLife*0.24})`);
    atm.addColorStop(1,"rgba(2,3,8,0)");
    ctx.fillStyle=atm;ctx.fillRect(0,0,w,h);

    const dim=1-clamp01((t-(T.lettersEnd+0.25))/Math.max(0.75,T.textStart-T.lettersEnd-0.25))*0.55;
    for(const tr of bgTraces){
      const bp=clamp01((t-tr.delay)/tr.dur); if(bp<=0)continue;
      const reveal=ease(bp)*tr.len, boost=mouseBoost(tr.pts[0]);
      strokePath(tr.pts,reveal,tr.width,"#123a63",(0.1+coreLife*0.3+boost*0.35)*dim,boost*8);
      if(bp<1){const head=pointAt(tr.pts,reveal);node(head,1.4,0.4*dim,8,"#1f7fd6");}
    }

    const sp=clamp01((t-T.signalStart)/(T.signalEnd-T.signalStart));
    if(sp>0){
      const prog=easeInOut(sp),dist=prog*signalLen,trailFade=clamp01((t-T.activation)/1.4);
      strokePath(signal,dist,2,"#168bff",(0.85-trailFade*0.4)*dim,12);
      strokePath(signal,dist,1,"#dcf1ff",(0.9-trailFade*0.6)*dim,8);
      let acc=0;
      for(let i=0;i<signal.length;i++){
        if(i>0)acc+=Math.hypot(signal[i].x-signal[i-1].x,signal[i].y-signal[i-1].y);
        if(acc>dist)break;
        node(signal[i],2.2,(0.5-trailFade*0.25)*dim,10);
      }
      if(sp<1){
        const head=pointAt(signal,dist);
        for(let i=1;i<=7;i++)node(pointAt(signal,Math.max(0,dist-i*5)),2.6-i*0.3,0.4-i*0.05,14,"#9bd8ff");
        energyPoint(head,0.55+sp*0.55,1);
      }
    }

    const burst=clamp01((t-T.activation)/(T.activationEnd-T.activation));
    if(burst>0&&burst<1){
      ring(center,easeInOut(burst)*Math.min(w,h)*0.4,(1-burst)*0.55,2-burst*1.4);
      ring(center,easeInOut(clamp01(burst*1.6))*Math.min(w,h)*0.24,(1-burst)*0.38,1.4);
    }
    if(t>T.activation-0.15){
      const pulse=0.55+0.45*Math.sin(t*2.4);
      const coreFade=1-clamp01((t-T.lettersEnd)/1.2)*0.7;
      energyPoint(center,0.55+pulse*0.25,(clamp01(1.4-burst)*0.85+0.1)*coreFade);
    }

    if(t>T.lettersEnd){
      const cyc=((t-T.lettersEnd)%2.6)/2.6;
      ring(center,cyc*Math.min(w,h)*0.6,(1-cyc)*0.14*dim,1.2);
    }

    for(const tr of netTraces){
      const p=clamp01((t-tr.delay)/tr.dur); if(p<=0)continue;
      const reveal=ease(p)*tr.len;
      const settle=clamp01((t-tr.delay-tr.dur)/0.9);
      const alpha=0.6*(0.5+0.5*(1-settle*0.5))*dim;
      strokePath(tr.pts,reveal,tr.width,"#1f7fd6",alpha,8);
      const end=pointAt(tr.pts,reveal), boost=mouseBoost(end);
      node(end,1.9+boost*1.6,(0.45+boost*0.5)*dim,10+boost*14);
      if(tr.particle&&p>=1){
        const q=(t*tr.particle.speed+tr.particle.offset)%1;
        node(pointAt(tr.pts,q*tr.len),1.6,0.85*dim,12,"#e8f6ff");
      }
    }

    const live=clamp01((t-T.lettersEnd)/0.8);
    for(const tr of letterTraces){
      const mp=clamp01((t-tr.morphStart)/tr.morphDur); if(mp<=0)continue;
      const m=easeInOut(mp);
      const pts=tr.dst.map((d,i)=>{const s=tr.src[i];return{x:s.x+(d.x-s.x)*m,y:s.y+(d.y-s.y)*m};});
      const len=pathLength(pts);
      const reveal=easeInOut(clamp01(mp/0.92))*len;
      const settled=clamp01((mp-0.55)/0.45);
      const bloom=clamp01((t-T.lettersEnd)/0.9)*(1-clamp01((t-T.aliveEnd)/1.2)*0.6);
      const boost=mouseBoost(pointAt(pts,len*0.5));
      const a=0.16+0.84*settled;
      strokePath(pts,reveal,tr.width+2.4,"#0f6ec4",(0.18+bloom*0.24+boost*0.14)*a,26+bloom*10);
      strokePath(pts,reveal,tr.width,"#3fb0ff",(0.72+live*0.28)*a,16+bloom*6);
      strokePath(pts,reveal,Math.max(0.7,tr.width*0.45),"#ffffff",(0.34+live*0.5)*a,8);
      let acc=0;
      for(let i=0;i<pts.length;i++){
        if(i>0)acc+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
        if(acc>reveal)break;
        node(pts[i],(i===0||i===pts.length-1)?2.6:1.9,(0.5+live*0.4)*a,12);
      }
      if(mp<1)node(pointAt(pts,reveal),2.6,0.9,18,"#eaf7ff");
      if(mp>=1&&t>T.lettersEnd-0.1){
        const q=(t*tr.particle.speed+tr.particle.offset)%1,pp=pointAt(pts,q*len);
        node(pp,2.2,0.95,16,"#ffffff"); node(pp,5,0.22,22,"#3fb0ff");
      }
    }

    const tp=t>=T.taglineStart?2:t>=T.textStart?1:0;
    if(tp!==lastTextPhase){lastTextPhase=tp;setPhaseText(tp);}
    if(!finished&&t>=T.done)complete();

    raf=requestAnimationFrame(frame);
  }

  const onMove=(e)=>{
    const r=canvas.getBoundingClientRect();
    mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top;
  };
  const onLeave=()=>{mouse.x=-9999;mouse.y=-9999;};

  function cleanup(){
    cancelAnimationFrame(raf);
    window.removeEventListener("resize",resize);
    window.removeEventListener("pointermove",onMove);
    window.removeEventListener("pointerleave",onLeave);
  }

  function resize(){
    dpr=Math.min(window.devicePixelRatio||1,2);
    w=canvas.clientWidth; h=canvas.clientHeight;
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    build();
  }

  resize();
  window.addEventListener("resize",resize);
  window.addEventListener("pointermove",onMove,{passive:true});
  window.addEventListener("pointerleave",onLeave,{passive:true});
  raf=requestAnimationFrame(frame);

  /* Retira listeners e o canvas depois da conclusão para não gastar CPU. */
  overlay.addEventListener("transitionend",(event)=>{
    if(event.propertyName==="opacity" && overlay.classList.contains("is-done")){
      cleanup();
      overlay.remove();
    }
  });
})();
