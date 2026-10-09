import { ObstacleDef } from '../types';

export class VectorEnvironment {
  public render(
    ctx: CanvasRenderingContext2D,
    camX: number,
    groundY: number,
    distance: number,
    viewWidth?: number,
    viewHeight?: number
  ) {
    // Determine the full logical canvas dimensions (cover all screens, wide viewports, 4K and ultra-wide)
    const effectiveWidth = Math.max(
      viewWidth || 0,
      ctx.canvas.width / (ctx.getTransform?.().a || 1),
      window.innerWidth || 1920
    ) + 1200;

    const effectiveHeight = Math.max(
      viewHeight || 0,
      ctx.canvas.height / (ctx.getTransform?.().d || 1),
      window.innerHeight || 1080
    ) + 600;

    // 1. Background Wall / Minimalist Urban Concrete (Dark Atmospheric Tone)
    ctx.fillStyle = '#0f172a'; // Deep slate dark atmosphere
    ctx.fillRect(-200, -200, effectiveWidth + 400, effectiveHeight + 400);

    // Urban Concrete Brick Wall with crisp thin lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const brickW = 80;
    const brickH = 35;
    const wallStartY = Math.max(0, groundY - 360);

    for (let y = wallStartY; y < groundY; y += brickH) {
      const offsetX = ((y / brickH) % 2 === 0 ? 0 : brickW / 2) - (camX * 0.3) % brickW;
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(effectiveWidth + 200, y);
      ctx.stroke();

      for (let x = offsetX - 200; x < effectiveWidth + brickW + 200; x += brickW) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + brickH);
        ctx.stroke();
      }
    }

    // Distant Subway Pillars / Doorways / Streetlight Silhouettes
    const pillarSpacing = 260;
    const pillarOffset = -(camX * 0.45) % pillarSpacing;
    for (let x = pillarOffset - 250; x < effectiveWidth + 250; x += pillarSpacing) {
      // Concrete Pillar
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, groundY - 260, 26, 260, 3);
      ctx.fill();
      ctx.stroke();

      // Industrial Lamp on Pillar
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + 13, groundY - 245, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Solid Asphalt Ground & Sidewalk Curb (Renders fully across the right side and beyond)
    ctx.fillStyle = '#1e293b'; // Solid asphalt road
    ctx.fillRect(-200, groundY, effectiveWidth + 400, effectiveHeight - groundY + 400);

    // Sidewalk curb top line
    ctx.fillStyle = '#334155';
    ctx.fillRect(-200, groundY, effectiveWidth + 400, 6);

    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-200, groundY);
    ctx.lineTo(effectiveWidth + 200, groundY);
    ctx.stroke();

    // Yellow Dashed Center Line on Asphalt
    const dashW = 42;
    const dashGap = 36;
    const dashPeriod = dashW + dashGap;
    const dashOffset = -(camX) % dashPeriod;

    ctx.fillStyle = '#eab308';
    for (let x = dashOffset - 200; x < effectiveWidth + 200; x += dashPeriod) {
      ctx.fillRect(x, groundY + 32, dashW, 4.5);
    }
  }

  public renderObstacle(ctx: CanvasRenderingContext2D, obs: ObstacleDef, camX: number, groundY: number) {
    const scrX = obs.x * 28 - camX;
    const width = obs.width * 28;
    const height = obs.height * 38;

    if (scrX < -200 || scrX > ctx.canvas.width + 400) return;

    ctx.save();
    ctx.translate(scrX, groundY);

    if (obs.type === 'hole') {
      // Deep Road Hole / Pit
      ctx.fillStyle = '#020617'; // Abyss black
      ctx.fillRect(-width / 2, 0, width, 40);

      // Warning hazard marks on edges
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-width / 2 - 4, 0, 4, 12);
      ctx.fillRect(width / 2, 0, 4, 12);
      ctx.restore();
      return;
    }

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, width / 2 + 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (obs.type === 'bus_wreck') {
      // Long abandoned city bus: layered body, windows, broken glass and heavy wheels.
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height * 0.72, width, height * 0.72, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-width * 0.44, -height, width * 0.88, height * 0.36, 3);
      ctx.fill();
      ctx.stroke();

      // Individual side windows
      ctx.fillStyle = '#0f172a';
      for (let i = 0; i < 5; i++) {
        const windowX = -width * 0.38 + i * width * 0.155;
        ctx.fillRect(windowX, -height * 0.94, width * 0.115, height * 0.22);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(windowX, -height * 0.94, width * 0.115, height * 0.22);
      }

      // Cracked windshield and rust streaks
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(width * 0.24, -height * 0.97);
      ctx.lineTo(width * 0.16, -height * 0.76);
      ctx.lineTo(width * 0.28, -height * 0.82);
      ctx.stroke();
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(-width * 0.2, -height * 0.62, width * 0.28, 3);

      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(-width * 0.32, -2, 9, 0, Math.PI * 2);
      ctx.arc(width * 0.32, -2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-width * 0.32, -2, 4, 0, Math.PI * 2);
      ctx.arc(width * 0.32, -2, 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (obs.type === 'car_wreck') {
      // Vector Abandoned Car Wreck
      ctx.fillStyle = '#7c2d12'; // Rusty Maroon
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;

      // Chassis
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height * 0.55, width, height * 0.55, 4);
      ctx.fill();
      ctx.stroke();

      // Cabin & Windows
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-width * 0.28, -height, width * 0.56, height * 0.48, 3);
      ctx.fill();
      ctx.stroke();

      // 2 Tires
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-width * 0.3, 0, 8, 0, Math.PI * 2);
      ctx.arc(width * 0.3, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (obs.type === 'rock') {
      // Vector Rock / Stone Barricade
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(-width / 2, 0);
      ctx.lineTo(-width * 0.35, -height);
      ctx.lineTo(width * 0.15, -height * 0.9);
      ctx.lineTo(width / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (obs.type === 'crate') {
      // Wooden Supply Crate
      ctx.fillStyle = '#92400e';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height, width, height, 3);
      ctx.fill();
      ctx.stroke();

      // Inner X cross pattern
      ctx.beginPath();
      ctx.moveTo(-width / 2 + 2, -height + 2);
      ctx.lineTo(width / 2 - 2, -2);
      ctx.moveTo(width / 2 - 2, -height + 2);
      ctx.lineTo(-width / 2 + 2, -2);
      ctx.stroke();
    } else if (obs.type === 'barrel') {
      // Toxic / Fuel Barrel
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height, width, height, 4);
      ctx.fill();
      ctx.stroke();

      // Hazard Stripes
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-width / 2 + 2, -height * 0.65, width - 4, 6);
    } else if (obs.type === 'fence') {
      // Wire Mesh Fence
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-width / 2, -height, width, height);
      ctx.beginPath();
      ctx.moveTo(-width / 2, 0);
      ctx.lineTo(width / 2, -height);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(-width / 2, -height);
      ctx.stroke();
    }

    ctx.restore();
  }
}
