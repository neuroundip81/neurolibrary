import { useEffect, useRef } from 'react';

// Simplex noise implementation
const perm: number[] = [];
for (let i = 0; i < 512; i++) perm[i] = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180][i & 255];

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function grad(hash: number, x: number, y: number) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise2D(x: number, y: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);
  const aa = perm[X + perm[Y]];
  const ab = perm[X + perm[Y + 1]];
  const ba = perm[X + 1 + perm[Y]];
  const bb = perm[X + 1 + perm[Y + 1]];
  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v,
  );
}

function calculateNoise(x: number, y: number, t: number): number {
  const freq = 0.01;
  return (
    noise2D(x * freq + t * 0.3, y * freq + t * 0.2) * 0.5 +
    noise2D(x * freq * 2 - t * 0.2, y * freq * 2 + t * 0.3) * 0.3 +
    noise2D(x * freq * 4 + t * 0.1, y * freq * 4 - t * 0.15) * 0.2
  );
}

interface Neuron {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  brightness: number;
  type: 'root' | 'branch' | 'leaf';
  displacementX: number;
  displacementY: number;
}

interface Connection {
  a: number;
  b: number;
}

interface Signal {
  connectionIndex: number;
  progress: number;
  speed: number;
  size: number;
}

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let time = 0;
    let globalAlpha = 1;

    const colors = {
      rootNode: '#14b8a6',
      branchNode: '#0e7490',
      leafNode: '#ec4899',
      connection: 'rgba(14, 116, 144, 0.15)',
      signal: '#f59e0b',
    };

    let neurons: Neuron[] = [];
    let connections: Connection[] = [];
    let signals: Signal[] = [];

    function initNeurons() {
      neurons = [];
      connections = [];
      signals = [];

      const cols = 10;
      const rows = 8;
      const cellW = w / cols;
      const cellH = h / rows;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ox = (Math.random() - 0.5) * 0.15;
          const oy = (Math.random() - 0.5) * 0.15;
          const x = (col + 0.5 + ox) * cellW;
          const y = (row + 0.5 + oy) * cellH;
          neurons.push({
            x, y,
            baseX: x, baseY: y,
            vx: 0, vy: 0,
            size: 3 + Math.random() * 4,
            brightness: 0.5 + Math.random() * 0.5,
            type: 'leaf',
            displacementX: 0,
            displacementY: 0,
          });
        }
      }

      // Relax with physics
      for (let iter = 0; iter < 20; iter++) {
        for (let i = 0; i < neurons.length; i++) {
          for (let j = i + 1; j < neurons.length; j++) {
            const dx = neurons[j].x - neurons[i].x;
            const dy = neurons[j].y - neurons[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80 && dist > 0) {
              const force = (80 - dist) / 80 * 0.5;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              neurons[i].x -= fx;
              neurons[i].y -= fy;
              neurons[j].x += fx;
              neurons[j].y += fy;
            }
          }
        }
        // Attraction to base
        for (const n of neurons) {
          n.x += (n.baseX - n.x) * 0.1;
          n.y += (n.baseY - n.y) * 0.1;
        }
      }

      // Build connections
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const dx = neurons[j].x - neurons[i].x;
          const dy = neurons[j].y - neurons[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            connections.push({ a: i, b: j });
          }
        }
      }

      // Assign types by degree
      const degrees = new Array(neurons.length).fill(0);
      for (const c of connections) {
        degrees[c.a]++;
        degrees[c.b]++;
      }
      for (let i = 0; i < neurons.length; i++) {
        if (degrees[i] > 3) neurons[i].type = 'root';
        else if (degrees[i] >= 2) neurons[i].type = 'branch';
        else neurons[i].type = 'leaf';
      }

      // Create signals
      const signalCount = 3 + Math.floor(Math.random() * 3);
      for (let s = 0; s < signalCount; s++) {
        if (connections.length > 0) {
          signals.push({
            connectionIndex: Math.floor(Math.random() * connections.length),
            progress: Math.random(),
            speed: 0.005 + Math.random() * 0.01,
            size: 2 + Math.random() * 2,
          });
        }
      }
    }

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx!.scale(dpr, dpr);
      initNeurons();
    }

    function getNeuronColor(n: Neuron): string {
      switch (n.type) {
        case 'root': return colors.rootNode;
        case 'branch': return colors.branchNode;
        case 'leaf': return colors.leafNode;
      }
    }

    function animate() {
      const context = ctx!;
      time += 0.016;

      // Trail effect
      context.fillStyle = `rgba(240, 249, 255, ${0.05 * globalAlpha})`;
      context.fillRect(0, 0, w, h);

      const mouse = mouseRef.current;

      // Update neurons
      for (const n of neurons) {
        const noise = calculateNoise(n.baseX, n.baseY, time);
        n.vx += Math.cos(noise * Math.PI * 2) * 0.02;
        n.vy += Math.sin(noise * Math.PI * 2) * 0.02;

        // Mouse repulsion
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = ((120 - dist) / 120) * 3;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }

        n.vx *= 0.95;
        n.vy *= 0.95;
        n.displacementX *= 0.95;
        n.displacementY *= 0.95;
        n.displacementX += n.vx;
        n.displacementY += n.vy;
      }

      // Draw connections
      for (const conn of connections) {
        const a = neurons[conn.a];
        const b = neurons[conn.b];
        const ax = a.baseX + a.displacementX;
        const ay = a.baseY + a.displacementY;
        const bx = b.baseX + b.displacementX;
        const by = b.baseY + b.displacementY;

        // Convert hex to rgba for connections
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        context.strokeStyle = hexToRgba(colors.branchNode, 0.15 * globalAlpha);
        context.lineWidth = 0.5;
        context.moveTo(ax, ay);
        context.lineTo(bx, by);
        context.stroke();
      }

      // Draw signals
      for (const sig of signals) {
        sig.progress += sig.speed;
        if (sig.progress >= 1) {
          sig.progress = 0;
          sig.connectionIndex = Math.floor(Math.random() * connections.length);
        }
        const conn = connections[sig.connectionIndex];
        if (conn) {
          const a = neurons[conn.a];
          const b = neurons[conn.b];
          const sx = (a.baseX + a.displacementX) + ((b.baseX + b.displacementX) - (a.baseX + a.displacementX)) * sig.progress;
          const sy = (a.baseY + a.displacementY) + ((b.baseY + b.displacementY) - (a.baseY + a.displacementY)) * sig.progress;

          context.beginPath();
          context.fillStyle = colors.signal;
          context.globalAlpha = globalAlpha;
          context.arc(sx, sy, sig.size, 0, Math.PI * 2);
          context.fill();

          // Glow
          const glow = context.createRadialGradient(sx, sy, 0, sx, sy, sig.size * 4);
          glow.addColorStop(0, `rgba(245, 158, 11, ${0.4 * globalAlpha})`);
          glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
          context.fillStyle = glow;
          context.beginPath();
          context.arc(sx, sy, sig.size * 4, 0, Math.PI * 2);
          context.fill();
          context.globalAlpha = 1;
        }
      }

      // Draw neurons
      for (const n of neurons) {
        const x = n.baseX + n.displacementX;
        const y = n.baseY + n.displacementY;
        const color = getNeuronColor(n);

        // Glow
        const glow = context.createRadialGradient(x, y, 0, x, y, n.size * 5);
        const hexToRgba = (hex: string, a: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        };
        glow.addColorStop(0, hexToRgba(color, 0.3 * globalAlpha * n.brightness));
        glow.addColorStop(1, hexToRgba(color, 0));
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, n.size * 5, 0, Math.PI * 2);
        context.fill();

        // Core
        context.beginPath();
        context.fillStyle = hexToRgba(color, globalAlpha * n.brightness);
        context.arc(x, y, n.size, 0, Math.PI * 2);
        context.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    }

    function handleMouseLeave() {
      mouseRef.current.active = false;
    }

    resize();
    animate();

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
