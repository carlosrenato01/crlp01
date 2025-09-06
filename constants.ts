import { EditFunction, ImageStyle, AspectRatio, CameraAngle, LightingStyle } from './types';

export const EDIT_FUNCTIONS = [
  { id: EditFunction.Retouch, icon: '🎯', name: 'Retoque' },
  { id: EditFunction.ControlNet, icon: '💃', name: 'ControlNet Pose' },
  { id: EditFunction.Inpainting, icon: '🖌️', name: 'Pintar Área' },
  { id: EditFunction.BackgroundRemoval, icon: '✂️', name: 'Remover Fundo' },
  { id: EditFunction.RemoveWatermark, icon: '💧', name: "Remover Marca D'água" },
  { id: EditFunction.Expand, icon: '↔️', name: 'Expandir' },
  { id: EditFunction.Restore, icon: '🪄', name: 'Restauração' },
  { id: EditFunction.Colorize, icon: '🌈', name: 'Colorização' },
  { id: EditFunction.SelectiveColor, icon: '🎨', name: 'Ajuste de Cor' },
  { id: EditFunction.Compose, icon: '🖼️', name: 'Combinar' },
];

export const ASPECT_RATIOS: { id: AspectRatio; name: string }[] = [
    { id: '1:1', name: 'Quadrado' },
    { id: '16:9', name: 'Paisagem' },
    { id: '9:16', name: 'Retrato' },
];

export const CAMERA_ANGLES: { id: CameraAngle; name: string; description: string }[] = [
  { id: CameraAngle.EyeLevel, name: 'Nível do Olhar', description: ', eye-level shot' },
  { id: CameraAngle.LowAngle, name: 'Ângulo Baixo', description: ', low-angle shot, looking up' },
  { id: CameraAngle.HighAngle, name: 'Ângulo Alto', description: ', high-angle shot, looking down' },
  { id: CameraAngle.BirdsEyeView, name: 'Visão de Pássaro', description: ", bird's-eye view, top-down shot" },
  { id: CameraAngle.WormsEyeView, name: 'Visão de Verme', description: ", worm's-eye view, shot from below" },
  { id: CameraAngle.DutchAngle, name: 'Ângulo Holandês', description: ', dutch angle, tilted frame' },
  { id: CameraAngle.OverTheShoulder, name: 'Sobre o Ombro', description: ', over-the-shoulder shot' },
  { id: CameraAngle.CloseUp, name: 'Close-up', description: ', close-up shot' },
  { id: CameraAngle.ExtremeCloseUp, name: 'Close-up Extremo', description: ', extreme close-up shot' },
  { id: CameraAngle.MediumShot, name: 'Plano Médio', description: ', medium shot' },
  { id: CameraAngle.LongShot, name: 'Plano Geral', description: ', long shot, full body' },
  { id: CameraAngle.WideShot, name: 'Plano Amplo', description: ', wide shot, establishing shot' },
];

export const LIGHTING_STYLES: { id: LightingStyle; name: string; description: string }[] = [
  { id: LightingStyle.Studio, name: 'Estúdio', description: ', studio lighting, professional lighting' },
  { id: LightingStyle.Cinematic, name: 'Cinemática', description: ', cinematic lighting, dramatic light' },
  { id: LightingStyle.GoldenHour, name: 'Golden Hour', description: ', golden hour lighting, warm soft light' },
  { id: LightingStyle.BlueHour, name: 'Blue Hour', description: ', blue hour lighting, cool soft light' },
  { id: LightingStyle.HighKey, name: 'High Key', description: ', high-key lighting, bright, minimal shadows' },
  { id: LightingStyle.LowKey, name: 'Low Key', description: ', low-key lighting, dark, dramatic shadows, chiaroscuro' },
  { id: LightingStyle.Backlight, name: 'Contraluz', description: ', backlight, backlit subject, silhouette lighting' },
  { id: LightingStyle.RimLight, name: 'Luz de Contorno', description: ', rim lighting, edge lighting' },
  { id: LightingStyle.HardLight, name: 'Luz Dura', description: ', hard lighting, harsh shadows, direct light' },
  { id: LightingStyle.SoftLight, name: 'Luz Suave', description: ', soft lighting, diffused light, soft shadows' },
];

export const STYLE_OPTIONS = [
  { id: ImageStyle.Realistic, name: 'Realista', icon: '📸',
    classes: {
      base: 'border-gray-700 hover:border-sky-500 hover:bg-sky-500/10',
      selected: 'border-sky-500 ring-2 ring-sky-500/50 bg-sky-500/10',
    }
  },
  { id: ImageStyle.Anime, name: 'Anime', icon: '🌸',
    classes: {
      base: 'border-gray-700 hover:border-pink-500 hover:bg-pink-500/10',
      selected: 'border-pink-500 ring-2 ring-pink-500/50 bg-pink-500/10',
    }
  },
  { id: ImageStyle.Watercolor, name: 'Aquarela', icon: '🎨',
    classes: {
      base: 'border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/10',
      selected: 'border-cyan-500 ring-2 ring-cyan-500/50 bg-cyan-500/10',
    }
  },
  { id: ImageStyle.BlackAndWhite, name: 'P&B', icon: '🔳',
    classes: {
      base: 'border-gray-700 hover:border-gray-500 hover:bg-gray-500/10',
      selected: 'border-gray-400 ring-2 ring-gray-400/50 bg-gray-500/10 text-white',
    }
  },
  { id: ImageStyle.Ghibli, name: 'Ghibli', icon: '🍃',
    classes: {
      base: 'border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10',
      selected: 'border-emerald-500 ring-2 ring-emerald-500/50 bg-emerald-500/10',
    }
  },
  { id: ImageStyle.Pixar, name: '3D Pixar', icon: '🧸',
    classes: {
      base: 'border-gray-700 hover:border-amber-500 hover:bg-amber-500/10',
      selected: 'border-amber-500 ring-2 ring-amber-500/50 bg-amber-500/10',
    }
  },
  { id: ImageStyle.Cyberpunk, name: 'Cyberpunk', icon: '🤖',
    classes: {
      base: 'border-gray-700 hover:border-fuchsia-500 hover:bg-fuchsia-500/10',
      selected: 'border-fuchsia-500 ring-2 ring-fuchsia-500/50 bg-fuchsia-500/10',
    }
  },
  { id: ImageStyle.Vaporwave, name: 'Vaporwave', icon: '🌴',
    classes: {
      base: 'border-gray-700 hover:border-teal-500 hover:bg-teal-500/10',
      selected: 'border-teal-500 ring-2 ring-teal-500/50 bg-teal-500/10',
    }
  },
  { id: ImageStyle.LineArt, name: 'Line Art', icon: '✏️',
    classes: {
      base: 'border-gray-700 hover:border-indigo-500 hover:bg-indigo-500/10',
      selected: 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-500/10',
    }
  },
  { id: ImageStyle.Sticker, name: 'Adesivo', icon: '✨',
    classes: {
      base: 'border-gray-700 hover:border-yellow-400 hover:bg-yellow-400/10',
      selected: 'border-yellow-400 ring-2 ring-yellow-400/50 bg-yellow-400/10',
    }
  },
  { id: ImageStyle.Logo, name: 'Logo', icon: '✒️',
    classes: {
      base: 'border-gray-700 hover:border-rose-500 hover:bg-rose-500/10',
      selected: 'border-rose-500 ring-2 ring-rose-500/50 bg-rose-500/10',
    }
  },
  { id: ImageStyle.Comic, name: 'HQ', icon: '💥',
    classes: {
      base: 'border-gray-700 hover:border-orange-500 hover:bg-orange-500/10',
      selected: 'border-orange-500 ring-2 ring-orange-500/50 bg-orange-500/10',
    }
  },
  { id: ImageStyle.FantasyArt, name: 'Fantasia', icon: '🐉',
    classes: {
      base: 'border-gray-700 hover:border-purple-500 hover:bg-purple-500/10',
      selected: 'border-purple-500 ring-2 ring-purple-500/50 bg-purple-500/10',
    }
  },
  { id: ImageStyle.Sketch, name: 'Esboço', icon: '✍️',
    classes: {
      base: 'border-gray-700 hover:border-stone-500 hover:bg-stone-500/10',
      selected: 'border-stone-400 ring-2 ring-stone-400/50 bg-stone-500/10 text-white',
    }
  },
  { id: ImageStyle.Abstract, name: 'Abstrato', icon: '🌀',
    classes: {
      base: 'border-gray-700 hover:border-red-500 hover:bg-red-500/10',
      selected: 'border-red-500 ring-2 ring-red-500/50 bg-red-500/10',
    }
  },
  { id: ImageStyle.Cinematic, name: 'Cinemático', icon: '🎬',
    classes: {
      base: 'border-gray-700 hover:border-yellow-500 hover:bg-yellow-500/10',
      selected: 'border-yellow-500 ring-2 ring-yellow-500/50 bg-yellow-500/10',
    }
  },
];