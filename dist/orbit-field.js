/* A projected, scroll-driven wireframe. Its owner controls timing and visibility. */
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const RING_COUNT = 4;
  const MAX_PARTICLES = 32;
  const BACK_COLOR = 'rgba(160, 24, 47, .23)';
  const FRONT_COLOR = 'rgba(240, 48, 77, .50)';
  const QUIET_BACK_COLOR = 'rgba(150, 27, 48, .13)';
  const QUIET_FRONT_COLOR = 'rgba(230, 54, 80, .27)';
  const DOT_COLOR = '#ff637d';
  const HALO_COLOR = 'rgba(236, 35, 74, .10)';

  window.createOrbitField = function createOrbitField(canvas) {
    let context = canvas && typeof canvas.getContext === 'function'
      ? canvas.getContext('2d', { alpha: true, desynchronized: true })
      : null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let segments = 0;
    let mobile = false;
    let destroyed = false;
    let points = null;
    let projected = null;

    // Allocated once; deterministic positions keep resize from reshuffling the field.
    const particleData = new Float32Array(MAX_PARTICLES * 4);
    let seed = 137;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < MAX_PARTICLES; i += 1) {
      const offset = i * 4;
      particleData[offset] = random() * TAU;
      particleData[offset + 1] = 1.12 + random() * .63;
      particleData[offset + 2] = (random() - .5) * 1.4;
      particleData[offset + 3] = .5 + random() * .65;
    }

    const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function createRings() {
      points = new Float32Array(RING_COUNT * (segments + 1) * 3);
      projected = new Float32Array(points.length);
      for (let ring = 0; ring < RING_COUNT; ring += 1) {
        // Different orbital planes produce a gyroscope rather than flat circles.
        const tilt = [.82, -.66, 1.24, .18][ring];
        const turn = [.25, 1.13, -.65, 1.8][ring];
        const radius = [1, 1.14, .86, 1.36][ring];
        const tiltCos = Math.cos(tilt);
        const tiltSin = Math.sin(tilt);
        const turnCos = Math.cos(turn);
        const turnSin = Math.sin(turn);
        for (let segment = 0; segment <= segments; segment += 1) {
          const angle = segment / segments * TAU;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const tiltedY = y * tiltCos;
          const tiltedZ = y * tiltSin;
          const offset = (ring * (segments + 1) + segment) * 3;
          points[offset] = x * turnCos + tiltedZ * turnSin;
          points[offset + 1] = tiltedY;
          points[offset + 2] = -x * turnSin + tiltedZ * turnCos;
        }
      }
    }

    function clear() {
      if (!context || destroyed) return;
      context.clearRect(0, 0, width, height);
    }

    function resize(nextWidth, nextHeight) {
      if (!context || destroyed) return;
      width = clamp(finite(nextWidth, 0), 0, 8000);
      height = clamp(finite(nextHeight, 0), 0, 8000);
      mobile = width < 700;
      const nextSegments = mobile ? 56 : 88;
      dpr = Math.min(finite(window.devicePixelRatio, 1) || 1, mobile ? 2 : 1.5);
      // Cap backing storage for unusually large displays without changing CSS size.
      dpr = Math.min(dpr, 8192 / Math.max(1, width, height));
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.lineJoin = 'round';
      context.lineCap = 'round';
      if (segments !== nextSegments) {
        segments = nextSegments;
        createRings();
      }
    }

    function render(state) {
      if (!context || destroyed || !points || width <= 0 || height <= 0) return;
      const time = finite(state && state.time, 0);
      const progress = clamp(finite(state && state.progress, 0), 0, 1);
      const pointerX = clamp(finite(state && state.pointerX, 0), -1, 1);
      const pointerY = clamp(finite(state && state.pointerY, 0), -1, 1);
      const radius = mobile ? Math.min(width * .36, height * .24)
        : Math.min(width * .30, height * .43);
      const centerX = width * (mobile ? .60 : .58);
      const centerY = height * (mobile ? .25 : .49);
      // Scroll supplies most movement; the idle rotation is deliberately slow.
      const angleX = -.16 + progress * 1.32 + pointerY * .14;
      const angleY = time * .055 + progress * 2.35 + pointerX * .18;
      const angleZ = -.16 - progress * .40;
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);
      const focal = 4.6;
      let x, y, z, rotatedX, rotatedY, rotatedZ, scale;

      clear();
      context.globalAlpha = 1 - progress * .30;
      for (let offset = 0; offset < points.length; offset += 3) {
        x = points[offset];
        y = points[offset + 1] * cosX - points[offset + 2] * sinX;
        z = points[offset + 1] * sinX + points[offset + 2] * cosX;
        rotatedX = x * cosY + z * sinY;
        rotatedZ = -x * sinY + z * cosY;
        rotatedY = y;
        scale = focal / (focal + rotatedZ);
        projected[offset] = centerX + (rotatedX * cosZ - rotatedY * sinZ) * radius * scale;
        projected[offset + 1] = centerY + (rotatedX * sinZ + rotatedY * cosZ) * radius * scale;
        projected[offset + 2] = rotatedZ;
      }

      // Dark rear arcs and brighter forward arcs communicate perspective at a glance.
      for (let pass = 0; pass < 2; pass += 1) {
        for (let ring = 0; ring < RING_COUNT; ring += 1) {
          const quiet = ring === RING_COUNT - 1;
          context.strokeStyle = pass === 0
            ? (quiet ? QUIET_BACK_COLOR : BACK_COLOR)
            : (quiet ? QUIET_FRONT_COLOR : FRONT_COLOR);
          context.lineWidth = quiet ? .65 : (pass === 0 ? .65 : .9);
          context.beginPath();
          let connected = false;
          const start = ring * (segments + 1) * 3;
          const end = start + segments * 3;
          for (let offset = start; offset < end; offset += 3) {
            const near = projected[offset + 2] + projected[offset + 5] < 0;
            if (near === (pass === 1)) {
              if (!connected) context.moveTo(projected[offset], projected[offset + 1]);
              context.lineTo(projected[offset + 3], projected[offset + 4]);
              connected = true;
            } else {
              connected = false;
            }
          }
          context.stroke();
        }
      }

      // A few moving beacons make the ring depth readable without adding bloom filters.
      for (let ring = 0; ring < RING_COUNT - 1; ring += 1) {
        const phase = ((time * .018 * (ring % 2 ? -1 : 1) + ring * .29 + progress * .22) % 1 + 1) % 1;
        const segment = Math.floor(phase * segments);
        const offset = (ring * (segments + 1) + segment) * 3;
        const dotSize = projected[offset + 2] < 0 ? 2 : 1.3;
        context.fillStyle = HALO_COLOR;
        context.beginPath();
        context.arc(projected[offset], projected[offset + 1], dotSize * 4, 0, TAU);
        context.fill();
        context.fillStyle = DOT_COLOR;
        context.beginPath();
        context.arc(projected[offset], projected[offset + 1], dotSize, 0, TAU);
        context.fill();
      }

      const count = mobile ? 18 : MAX_PARTICLES;
      context.fillStyle = '#ef4265';
      for (let i = 0; i < count; i += 1) {
        const offset = i * 4;
        const angle = particleData[offset] + time * .015 + progress * .38;
        x = Math.cos(angle) * particleData[offset + 1];
        y = Math.sin(angle) * particleData[offset + 1] * .77;
        z = particleData[offset + 2];
        rotatedX = x * cosY + z * sinY;
        rotatedZ = -x * sinY + z * cosY;
        rotatedY = y * cosX - rotatedZ * sinX;
        rotatedZ = y * sinX + rotatedZ * cosX;
        scale = focal / (focal + rotatedZ);
        context.globalAlpha = (.19 + (Math.sin(time * .7 + i * 2.4) + 1) * .12) * (1 - progress * .40);
        context.beginPath();
        context.arc(centerX + rotatedX * radius * scale,
          centerY + rotatedY * radius * scale,
          particleData[offset + 3] * scale, 0, TAU);
        context.fill();
      }
      context.globalAlpha = 1;
    }

    function destroy() {
      if (destroyed) return;
      clear();
      destroyed = true;
      points = null;
      projected = null;
      context = null;
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }

    return { resize, render, clear, destroy };
  };
})();
