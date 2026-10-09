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

    // 1. Interior de uma casa abandonada: parede azul-acinzentada, rodapé,
    // quadros, portas e escada. O estilo é desenhado em camadas para combinar
    // com a referência visual de survival horror 2.5D.
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#111925');
    sky.addColorStop(0.55, '#263342');
    sky.addColorStop(1, '#526070');
    ctx.fillStyle = sky;
    ctx.fillRect(-200, -200, effectiveWidth + 400, effectiveHeight + 400);

    // Painéis e marcas de uma parede antiga.
    ctx.fillStyle = '#263544';
    ctx.fillRect(-200, Math.max(0, groundY - 390), effectiveWidth + 400, 390);
    ctx.strokeStyle = 'rgba(9, 15, 24, 0.42)';
    ctx.lineWidth = 2;
    const panelOffset = -((camX * 0.18) % 220);
    for (let x = panelOffset - 220; x < effectiveWidth + 300; x += 220) {
      ctx.beginPath();
      ctx.moveTo(x, groundY - 365);
      ctx.lineTo(x, groundY - 90);
      ctx.stroke();
      ctx.fillStyle = 'rgba(7, 12, 20, 0.12)';
      ctx.fillRect(x + 8, groundY - 355, 190, 250);
    }

    // Rachaduras discretas no reboco.
    ctx.strokeStyle = 'rgba(10, 16, 24, 0.45)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 7; i++) {
      const x = ((i * 317 - camX * 0.22) % (effectiveWidth + 240)) - 80;
      const y = groundY - 290 + (i % 3) * 62;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 9, y + 12);
      ctx.lineTo(x + 3, y + 24);
      ctx.lineTo(x + 18, y + 37);
      ctx.stroke();
    }

    // Rodapé alto com moldura e painéis inferiores.
    ctx.fillStyle = '#687888';
    ctx.fillRect(-200, groundY - 104, effectiveWidth + 400, 14);
    ctx.fillStyle = '#182432';
    ctx.fillRect(-200, groundY - 90, effectiveWidth + 400, 7);
    ctx.fillStyle = '#354657';
    ctx.fillRect(-200, groundY - 83, effectiveWidth + 400, 78);
    ctx.strokeStyle = 'rgba(8, 14, 22, 0.6)';
    ctx.lineWidth = 2;
    for (let x = panelOffset - 220; x < effectiveWidth + 300; x += 110) {
      ctx.strokeRect(x, groundY - 77, 98, 62);
    }

    // Portas escuras no fundo, em perspectiva lateral.
    const doorSpacing = 560;
    const doorOffset = -((camX * 0.38) % doorSpacing);
    for (let x = doorOffset - 280; x < effectiveWidth + 300; x += doorSpacing) {
      ctx.fillStyle = '#111923';
      ctx.fillRect(x, groundY - 330, 122, 232);
      ctx.fillStyle = '#202d3b';
      ctx.fillRect(x + 8, groundY - 322, 106, 216);
      ctx.strokeStyle = '#0b111a';
      ctx.lineWidth = 5;
      ctx.strokeRect(x + 8, groundY - 322, 106, 216);
      ctx.fillStyle = '#111b27';
      ctx.fillRect(x + 19, groundY - 300, 36, 168);
      ctx.fillRect(x + 65, groundY - 300, 36, 168);
      ctx.fillStyle = '#83909b';
      ctx.beginPath();
      ctx.arc(x + 99, groundY - 205, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moldura de quadro na parede, repetida com distância para dar profundidade.
    const frameSpacing = 720;
    const frameOffset = -((camX * 0.42) % frameSpacing);
    for (let x = frameOffset + 120; x < effectiveWidth + 250; x += frameSpacing) {
      const fy = groundY - 315;
      ctx.fillStyle = '#141c27';
      ctx.fillRect(x, fy, 88, 94);
      ctx.fillStyle = '#8a9299';
      ctx.fillRect(x + 5, fy + 5, 78, 84);
      ctx.fillStyle = '#202b38';
      ctx.fillRect(x + 11, fy + 11, 66, 72);
      ctx.strokeStyle = 'rgba(225, 232, 238, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 18, fy + 18);
      ctx.lineTo(x + 65, fy + 70);
      ctx.stroke();
    }

    // Escadaria de madeira à direita: a posição acompanha o deslocamento da câmera.
    const stairCycle = 1800;
    const stairX = ((1280 - camX * 0.72) % stairCycle + stairCycle) % stairCycle - 180;
    if (stairX < effectiveWidth + 180 && stairX > -420) {
      ctx.fillStyle = '#17202b';
      ctx.beginPath();
      ctx.moveTo(stairX + 70, groundY - 112);
      ctx.lineTo(stairX + 390, groundY - 385);
      ctx.lineTo(stairX + 430, groundY - 385);
      ctx.lineTo(stairX + 110, groundY - 112);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0c121b';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(stairX + 64, groundY - 112);
      ctx.lineTo(stairX + 390, groundY - 390);
      ctx.stroke();
      ctx.strokeStyle = '#87919a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(stairX + 65, groundY - 120);
      ctx.lineTo(stairX + 395, groundY - 398);
      ctx.stroke();
      for (let i = 0; i < 9; i++) {
        const sx = stairX + 92 + i * 34;
        const sy = groundY - 138 - i * 29;
        ctx.strokeStyle = '#111923';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 28, sy - 24);
        ctx.stroke();
        ctx.fillStyle = '#3e4a57';
        ctx.fillRect(sx - 4, sy - 4, 36, 5);
      }
    }

    // Facho de lanterna no centro: ilumina a zona jogável e mantém as bordas sombrias.
    const lightX = Math.max(160, Math.min(effectiveWidth - 160, thisLightX(camX, effectiveWidth)));
    const beam = ctx.createRadialGradient(lightX, groundY - 170, 8, lightX, groundY - 150, Math.max(240, effectiveWidth * 0.38));
    beam.addColorStop(0, 'rgba(214, 231, 255, 0.38)');
    beam.addColorStop(0.48, 'rgba(174, 199, 230, 0.13)');
    beam.addColorStop(1, 'rgba(5, 9, 15, 0)');
    ctx.fillStyle = beam;
    ctx.fillRect(-200, -200, effectiveWidth + 400, effectiveHeight + 400);

    // 2. Piso interior de madeira escura, com tábuas e sombras.
    const floorGradient = ctx.createLinearGradient(0, groundY, 0, effectiveHeight + 250);
    floorGradient.addColorStop(0, '#302d2b');
    floorGradient.addColorStop(0.35, '#1b1b1d');
    floorGradient.addColorStop(1, '#090b10');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(-200, groundY, effectiveWidth + 400, effectiveHeight - groundY + 400);

    ctx.fillStyle = '#10151d';
    ctx.fillRect(-200, groundY, effectiveWidth + 400, 8);
    ctx.strokeStyle = 'rgba(128, 139, 151, 0.18)';
    ctx.lineWidth = 1;
    const plankOffset = -((camX * 0.7) % 115);
    for (let x = plankOffset - 115; x < effectiveWidth + 300; x += 115) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 8);
      ctx.lineTo(x - 20, effectiveHeight + 250);
      ctx.stroke();
    }
    for (let y = groundY + 42; y < effectiveHeight + 250; y += 48) {
      ctx.strokeStyle = 'rgba(3, 6, 10, 0.32)';
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(effectiveWidth + 200, y);
      ctx.stroke();
    }

    // Vinheta cinematográfica nas bordas do cenário.
    const vignette = ctx.createRadialGradient(
      effectiveWidth * 0.5, groundY * 0.55, Math.min(80, effectiveWidth * 0.08),
      effectiveWidth * 0.5, groundY * 0.55, Math.max(effectiveWidth, effectiveHeight)
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.58)');
    ctx.fillStyle = vignette;
    ctx.fillRect(-200, -200, effectiveWidth + 400, effectiveHeight + 400);
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
