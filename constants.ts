import { EditFunction, ImageStyle, AspectRatio, CameraAngle, LightingStyle, LookMode, ArtistStyle, TrendMode } from './types';

export const LOOK_MODES = [
  { id: LookMode.Lookbook, icon: '👗', name: 'Lookbook de Estilo' },
  { id: LookMode.Headshots, icon: '💼', name: 'Fotos Profissionais' },
];

export const TREND_MODES = [
  { id: TrendMode.Doll, icon: '🧍', name: 'Boneco' },
  { id: TrendMode.Bust, icon: '🗿', name: 'Busto' },
  { id: TrendMode.Funko, icon: '🦸', name: 'Funko' },
];

export const LOOKBOOK_STYLES = [
  'Clássico / Casual', 'Streetwear', 'Vintage', 'Gótico', 'Preppy', 'Minimalista',
  'Athleisure', 'Old Money / Luxo Discreto', 'Boêmio (Boho)', 'Business Casual',
  'Grunge anos 90', 'Coquetel / Formal'
];

export const LOOKBOOK_PROMPTS = [
  { id: 'Look 1', base: 'uma foto de corpo inteiro, em pé' },
  { id: 'Look 2', base: 'uma foto de meio corpo, sorrindo' },
  { id: 'Look 3', base: 'uma foto espontânea andando' },
  { id: 'Look 4', base: 'uma foto mostrando detalhes da roupa' },
  { id: 'Look 5', base: 'uma pose sentada' },
  { id: 'Look 6', base: 'uma foto em close-up focando nos acessórios' },
];

export const HEADSHOT_PROMPTS = [
  { id: 'Terno Executivo', base: 'vestindo um terno escuro com uma camisa branca impecável' },
  { id: 'Casual Elegante', base: 'vestindo um suéter de malha casual elegante sobre uma camisa de colarinho' },
  { id: 'Profissional Criativo', base: 'vestindo uma gola alta escura' },
  { id: 'Visual Corporativo', base: 'vestindo uma camisa social azul clara' },
  { id: 'Moderno e Vibrante', base: 'vestindo um blazer colorido' },
  { id: 'Descontraído', base: 'vestindo uma camiseta simples de alta qualidade sob uma jaqueta casual' },
];

export const EDIT_FUNCTIONS = [
  { id: EditFunction.Retouch, icon: '🎯', name: 'Retoque' },
  { id: EditFunction.Inpainting, icon: '🖌️', name: 'Pintura Mágica' },
  { id: EditFunction.ControlNet, icon: '💃', name: 'ControlNet Pose' },
  { id: EditFunction.BackgroundRemoval, icon: '✂️', name: 'Remover Fundo' },
  { id: EditFunction.RemoveWatermark, icon: '💧', name: "Remover Marca D'água" },
  { id: EditFunction.Expand, icon: '↔️', name: 'Expandir' },
  { id: EditFunction.Restore, icon: '🪄', name: 'Restauração' },
  { id: EditFunction.Colorize, icon: '🌈', name: 'Colorização' },
  { id: EditFunction.SelectiveColor, icon: '🎨', name: 'Troca de Cor' },
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

export const ARTIST_STYLES: { id: ArtistStyle; name: string; description: string }[] = [
  { id: ArtistStyle.VanGogh, name: 'Van Gogh', description: ', in the expressive, post-impressionist style of Vincent van Gogh, with thick impasto brushstrokes and bold colors' },
  { id: ArtistStyle.DaVinci, name: 'Da Vinci', description: ', in the high renaissance style of Leonardo da Vinci, with sfumato lighting and anatomical precision' },
  { id: ArtistStyle.Dali, name: 'Salvador Dalí', description: ', in the surrealist style of Salvador Dalí, with dreamlike landscapes and bizarre imagery' },
  { id: ArtistStyle.Picasso, name: 'Picasso', description: ', in the cubist style of Pablo Picasso, with fragmented objects and multiple viewpoints' },
  { id: ArtistStyle.Monet, name: 'Monet', description: ', in the impressionist style of Claude Monet, capturing the effects of light with visible brushstrokes' },
  { id: ArtistStyle.Warhol, name: 'Andy Warhol', description: ', in the pop art style of Andy Warhol, with bold colors and screen-printing effects' },
  { id: ArtistStyle.Rembrandt, name: 'Rembrandt', description: ', in the baroque style of Rembrandt, with dramatic use of chiaroscuro (light and shadow)' },
  { id: ArtistStyle.Kahlo, name: 'Frida Kahlo', description: ', in the surrealist, folk art style of Frida Kahlo, with vibrant colors and symbolic self-portrait elements' },
  { id: ArtistStyle.Hokusai, name: 'Hokusai', description: ', in the Japanese ukiyo-e woodblock print style of Hokusai, with stylized lines and flat areas of color' },
  { id: ArtistStyle.Mucha, name: 'Alphonse Mucha', description: ', in the Art Nouveau style of Alphonse Mucha, with elegant, flowing lines and decorative floral motifs' },
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