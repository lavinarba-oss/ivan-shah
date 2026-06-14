/* ============================================================
   IVAN SHAH — 3D ambient scene
   Brass tools + wooden furniture floating in a bordeaux room.
   Three.js r128 · tasteful, slow, parallax to mouse + scroll.
   ============================================================ */
(function () {
  const canvas = document.getElementById('scene');
  if (!canvas || !window.THREE) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 760px)').matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0c0d10, 0.028);

  const camera = new THREE.PerspectiveCamera(44, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 13);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  /* ---------- Palette (dark industrial — electric blue + amber + steel) ---------- */
  const COL = {
    brass:     0x9fb8d6,  // cool steel
    brassDark: 0x6f86a4,
    steel:     0xc4ccd6,
    wood:      0x7a4a24,
    woodDark:  0x55321a,
    handle:    0x202833,  // graphite handle
    gold:      0x2e90ff,  // electric blue accent
    amber:     0xffb020,
  };

  function metal(color, rough, metal_) {
    return new THREE.MeshStandardMaterial({ color, roughness: rough ?? 0.35, metalness: metal_ ?? 0.9 });
  }
  function matte(color, rough) {
    return new THREE.MeshStandardMaterial({ color, roughness: rough ?? 0.75, metalness: 0.05 });
  }

  /* ---------- Lighting: cool studio + blue/amber accents ---------- */
  scene.add(new THREE.AmbientLight(0xbfc6d2, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(6, 8, 9); scene.add(key);
  const rim = new THREE.DirectionalLight(0x2e90ff, 1.6); rim.position.set(-8, 3, 4); scene.add(rim);
  const bluePt = new THREE.PointLight(0x2e90ff, 2.2, 42); bluePt.position.set(-5, -4, 7); scene.add(bluePt);
  const amberPt = new THREE.PointLight(0xffb020, 1.4, 36); amberPt.position.set(6, 5, 6); scene.add(amberPt);

  /* ============================================================
     BUILDERS
     ============================================================ */

  // — Wrench (гаечный ключ) —
  function buildWrench() {
    const g = new THREE.Group();
    const mat = metal(COL.brass, 0.3, 0.95);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.6, 0.16), mat);
    g.add(shaft);
    [1, -1].forEach((dir) => {
      const head = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.16, 14, 28), mat);
      head.add(ring);
      // open jaw notch
      const notch = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.5, 0.34), mat);
      notch.position.y = 0.42; head.add(notch);
      const gap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x4c0c17, roughness: 1 }));
      gap.position.y = 0.55; head.add(gap);
      head.position.y = dir * 1.5;
      head.rotation.z = dir > 0 ? 0 : Math.PI;
      g.add(head);
    });
    return g;
  }

  // — Screwdriver (отвёртка) —
  function buildScrewdriver() {
    const g = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 1.5, 20), matte(COL.handle, 0.5));
    handle.position.y = 0.9; g.add(handle);
    // grip ridges
    for (let i = 0; i < 6; i++) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.3, 0.9), matte(0x6d1322, 0.6));
      r.position.y = 0.9; r.rotation.y = (i / 6) * Math.PI; g.add(r);
    }
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 16), metal(COL.gold, 0.25, 1));
    collar.position.y = 0.05; g.add(collar);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.7, 16), metal(COL.steel, 0.2, 1));
    shaft.position.y = -0.85; g.add(shaft);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.02, 0.35, 12), metal(COL.steel, 0.2, 1));
    tip.position.y = -1.8; g.add(tip);
    return g;
  }

  // — Hammer (молоток) —
  function buildHammer() {
    const g = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.8, 16), matte(COL.wood, 0.6));
    g.add(handle);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.9, 16), matte(COL.handle, 0.5));
    grip.position.y = -1.1; g.add(grip);
    const headMat = metal(COL.brass, 0.32, 0.95);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 18), headMat);
    head.rotation.z = Math.PI / 2; head.position.y = 1.5; g.add(head);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.3, 18), headMat);
    face.rotation.z = Math.PI / 2; face.position.set(0.78, 1.5, 0); g.add(face);
    // claw
    const claw = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.1, 10, 16, Math.PI), headMat);
    claw.position.set(-0.7, 1.5, 0); claw.rotation.y = Math.PI / 2; g.add(claw);
    return g;
  }

  // — Drill (дрель) — (r128-safe: no CapsuleGeometry)
  function buildDrill() {
    const g = new THREE.Group();
    const bodyMat = matte(COL.handle, 0.45);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 20), bodyMat);
    body.rotation.z = Math.PI / 2; g.add(body);
    [0.8, -0.8].forEach((x) => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 14), bodyMat); c.position.x = x; g.add(c); });
    const chuck = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.5, 16), metal(COL.gold, 0.3, 1));
    chuck.rotation.z = Math.PI / 2; chuck.position.x = 1.25; g.add(chuck);
    const bit = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 12), metal(COL.steel, 0.2, 1));
    bit.rotation.z = Math.PI / 2; bit.position.x = 2.0; g.add(bit);
    const gripMat = matte(0x4c0c17, 0.5);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 16), gripMat);
    grip.position.set(-0.25, -0.95, 0); grip.rotation.z = 0.18; g.add(grip);
    const gripCap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), gripMat);
    gripCap.position.set(-0.17, -0.5, 0); g.add(gripCap);
    const battery = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.7), matte(COL.brassDark, 0.5));
    battery.position.set(-0.35, -1.55, 0); g.add(battery);
    return g;
  }

  // — Bolt / nut (болт с гайкой) —
  function buildBolt() {
    const g = new THREE.Group();
    const mat = metal(COL.brass, 0.3, 0.95);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 6), mat);
    head.position.y = 1.1; g.add(head);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 2.0, 18), mat);
    g.add(shaft);
    for (let i = 0; i < 9; i++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.04, 8, 18), mat);
      t.rotation.x = Math.PI / 2; t.position.y = -0.8 + i * 0.2; g.add(t);
    }
    return g;
  }

  // — Chair (стул — мебель) —
  function buildChair() {
    const g = new THREE.Group();
    const wood = matte(COL.wood, 0.62);
    const woodD = matte(COL.woodDark, 0.62);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 1.6), wood);
    g.add(seat);
    const legGeo = new THREE.BoxGeometry(0.2, 1.5, 0.2);
    [[-0.65, -0.85, -0.65], [0.65, -0.85, -0.65], [-0.65, -0.85, 0.65], [0.65, -0.85, 0.65]].forEach((p) => {
      const l = new THREE.Mesh(legGeo, woodD); l.position.set(...p); g.add(l);
    });
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.7, 0.2), wood);
    back.position.set(0, 0.95, -0.7); g.add(back);
    for (let i = -1; i <= 1; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.5, 0.12), woodD);
      slat.position.set(i * 0.5, 0.95, -0.62); g.add(slat);
    }
    return g;
  }

  // — Cabinet / drawer (комод — мебель) —
  function buildCabinet() {
    const g = new THREE.Group();
    const wood = matte(COL.wood, 0.6);
    const woodD = matte(COL.woodDark, 0.6);
    const box = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.4, 1.2), wood);
    g.add(box);
    for (let i = 0; i < 3; i++) {
      const d = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.66, 0.08), woodD);
      d.position.set(0, 0.78 - i * 0.78, 0.61); g.add(d);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), metal(COL.gold, 0.3, 1));
      knob.position.set(0, 0.78 - i * 0.78, 0.7); g.add(knob);
    }
    return g;
  }

  /* ============================================================
     POPULATE — scatter the pieces around the viewport edges
     ============================================================ */
  const builders = [buildWrench, buildScrewdriver, buildHammer, buildDrill, buildBolt, buildChair, buildCabinet];
  const objects = [];

  // hand-placed layout — ALL pieces clustered on the RIGHT side and
  // BELOW the portrait, so they never cover the headline text.
  const layout = [
    // right of / above the photo
    { b: 0, pos: [ 5.0,  4.4, -4], s: 0.55, spin: 0.011 },  // wrench above photo
    { b: 4, pos: [ 9.6,  3.0, -4], s: 0.46, spin: 0.014 },  // bolt top-right
    { b: 2, pos: [10.4,  0.7, -4], s: 0.52, spin: -0.013 }, // hammer right margin
    { b: 1, pos: [ 9.8, -1.8, -5], s: 0.48, spin: -0.012 }, // screwdriver right
    { b: 2, pos: [11.3,  2.2, -6], s: 0.42, spin: 0.012 },  // hammer far right upper
    { b: 0, pos: [10.9, -3.3, -6], s: 0.44, spin: -0.011 }, // wrench right lower
    // behind / beside the photo (peeking around the edges)
    { b: 3, pos: [ 6.4,  1.6, -8], s: 0.42, spin: 0.01 },   // drill behind photo (peeks)
    { b: 4, pos: [ 7.2, -0.6, -8], s: 0.36, spin: 0.015 },  // bolt behind photo
    { b: 0, pos: [ 3.6,  4.9, -6], s: 0.42, spin: 0.012 },  // wrench upper edge
    { b: 2, pos: [ 9.3,  1.5, -7], s: 0.4,  spin: -0.013 }, // hammer far right
    // below the photo
    { b: 3, pos: [ 8.4, -3.9, -4], s: 0.52, spin: 0.012 },  // drill bottom-right
    { b: 5, pos: [ 5.4, -4.8, -5], s: 0.46, spin: 0.008 },  // chair below photo
    { b: 6, pos: [ 7.6, -5.0, -7], s: 0.42, spin: 0.009 },  // cabinet far low-right
    { b: 4, pos: [ 4.0, -5.4, -6], s: 0.4,  spin: 0.013 },  // bolt under photo (left)
    { b: 1, pos: [ 6.7, -5.6, -6], s: 0.42, spin: -0.012 }, // screwdriver under photo
    { b: 2, pos: [ 5.0, -6.2, -7], s: 0.38, spin: 0.011 },  // hammer deep under photo
    { b: 0, pos: [ 9.0, -6.0, -8], s: 0.36, spin: -0.01 },  // wrench far under-right
  ];

  const used = isMobile ? layout.filter((_, i) => i % 2 === 0) : layout;

  used.forEach((cfg) => {
    const mesh = builders[cfg.b]();
    mesh.position.set(...cfg.pos);
    mesh.scale.setScalar(cfg.s * (isMobile ? 0.85 : 1));
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI * 0.3);
    mesh.userData = {
      spin: cfg.spin,
      floatAmp: 0.4 + Math.random() * 0.4,
      floatSpeed: 0.4 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      baseY: cfg.pos[1],
      tumble: 0.004 + Math.random() * 0.004,
    };
    scene.add(mesh);
    objects.push(mesh);
  });

  /* ---------- Brass dust motes ---------- */
  const moteCount = isMobile ? 60 : 140;
  const moteGeo = new THREE.BufferGeometry();
  const mp = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    mp[i * 3] = (Math.random() - 0.5) * 28;
    mp[i * 3 + 1] = (Math.random() - 0.5) * 18;
    mp[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
    color: COL.gold, size: 0.07, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(motes);

  /* ============================================================
     INTERACTION — mouse parallax + scroll drift
     ============================================================ */
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };

  if (!isMobile) {
    window.addEventListener('pointermove', (e) => {
      target.x = (e.clientX / innerWidth - 0.5);
      target.y = (e.clientY / innerHeight - 0.5);
    }, { passive: true });
  }

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  /* ---------- Animate ---------- */
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta ? 0.016 : 0.016, 0.033);

    // ease camera toward mouse for gentle parallax
    cur.x += (target.x - cur.x) * 0.05;
    cur.y += (target.y - cur.y) * 0.05;

    camera.position.x = cur.x * 2.2;
    camera.position.y = -cur.y * 1.6;
    camera.lookAt(0, 0, 0);

    objects.forEach((o) => {
      const u = o.userData;
      if (!reduced) {
        o.rotation.y += u.spin;
        o.rotation.x += u.tumble;
        o.position.y = u.baseY + Math.sin(t * u.floatSpeed + u.phase) * u.floatAmp;
      }
    });

    if (!reduced) motes.rotation.y = t * 0.02;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // intro: pieces ease in
  objects.forEach((o, i) => {
    const fs = o.scale.x;
    o.scale.setScalar(0.001);
    const start = performance.now() + i * 90;
    (function grow() {
      const p = Math.min(1, (performance.now() - start) / 700);
      const e = p < 0 ? 0 : 1 - Math.pow(1 - p, 3);
      o.scale.setScalar(0.001 + fs * e);
      if (p < 1) requestAnimationFrame(grow);
    })();
  });

  tick();
})();
