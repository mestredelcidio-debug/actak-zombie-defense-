import { BiomeConfig, BiomeType } from '../types';

export const BIOMES_CATALOG: Record<BiomeType, BiomeConfig> = {
  highway: {
    id: 'highway',
    name: 'FASE 1 — ESTRADA DESTRUÍDA',
    subtitle: 'Km 0 — Asfalto Rachado e Carros Abandonados',
    skyColor: 0xf97316, // Golden Sunset
    fogColor: 0xfdba74,
    groundColor: 0x475569,
    roadColor: 0x1e293b,
    lightColor: 0xffedd5,
    ambientColor: 0x7c2d12,
    lightIntensity: 1.4,
    description: 'Carros destruídos, pedras no asfalto e placas caídas sob um pôr do sol alaranjado.',
  },
  city: {
    id: 'city',
    name: 'FASE 2 — CIDADE DESTRUÍDA',
    subtitle: 'Km 1.000 — Metrópole em Ruínas',
    skyColor: 0x334155, // Overcast Moody Slate
    fogColor: 0x64748b,
    groundColor: 0x334155,
    roadColor: 0x0f172a,
    lightColor: 0xe2e8f0,
    ambientColor: 0x1e293b,
    lightIntensity: 1.2,
    description: 'Prédios arruinados, vitrines quebradas, postes caídos e becos perigosos.',
  },
  suburbs: {
    id: 'suburbs',
    name: 'FASE 3 — SUBÚRBIO',
    subtitle: 'Km 2.000 — Bairros Abandonados',
    skyColor: 0x0284c7, // Twilight Blue
    fogColor: 0x38bdf8,
    groundColor: 0x15803d,
    roadColor: 0x334155,
    lightColor: 0xffedd5,
    ambientColor: 0x0f172a,
    lightIntensity: 1.3,
    description: 'Casas desertas, cercas destruídas, jardins secos e carros nos gramados.',
  },
  forest: {
    id: 'forest',
    name: 'FASE 4 — FLORESTA SOMBRIA',
    subtitle: 'Km 3.000 — Trilha Nebulosa',
    skyColor: 0x064e3b, // Deep Forest Mist
    fogColor: 0x022c22,
    groundColor: 0x14532d,
    roadColor: 0x451a03,
    lightColor: 0x86efac,
    ambientColor: 0x022c22,
    lightIntensity: 1.1,
    description: 'Pinheiros retorcidos, rochas gigantes, neblina espessa e troncos caídos.',
  },
  industrial: {
    id: 'industrial',
    name: 'FASE 5 — ZONA INDUSTRIAL',
    subtitle: 'Km 4.000 — Fábricas e Contêineres',
    skyColor: 0xb91c1c, // Crimson Smog Sunset
    fogColor: 0x7f1d1d,
    groundColor: 0x27272a,
    roadColor: 0x18181b,
    lightColor: 0xfca5a5,
    ambientColor: 0x450a0a,
    lightIntensity: 1.35,
    description: 'Contêineres empilhados, tubulações de vapor, guindastes e maquinário enferrujado.',
  },
};
