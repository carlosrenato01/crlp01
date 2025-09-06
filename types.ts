export enum Mode {
  Create = 'create',
  Edit = 'edit',
}

export enum EditFunction {
  RemoveWatermark = 'remove-watermark',
  Retouch = 'retouch',
  Inpainting = 'inpainting',
  Expand = 'expand',
  Compose = 'compose',
  Restore = 'restore',
  Colorize = 'colorize',
  BackgroundRemoval = 'background-removal',
  SelectiveColor = 'selective-color',
  ControlNet = 'controlnet',
}

export enum ImageStyle {
  Realistic = 'realistic',
  Anime = 'anime',
  Watercolor = 'watercolor',
  BlackAndWhite = 'bw',
  Ghibli = 'ghibli',
  Pixar = 'pixar',
  Cyberpunk = 'cyberpunk',
  Vaporwave = 'vaporwave',
  LineArt = 'lineart',
  Sticker = 'sticker',
  Logo = 'logo',
  Comic = 'comic',
  FantasyArt = 'fantasy',
  Sketch = 'sketch',
  Abstract = 'abstract',
  Cinematic = 'cinematic',
}

export enum CameraAngle {
  EyeLevel = 'eye-level',
  LowAngle = 'low-angle',
  HighAngle = 'high-angle',
  BirdsEyeView = 'birds-eye-view',
  WormsEyeView = 'worms-eye-view',
  DutchAngle = 'dutch-angle',
  OverTheShoulder = 'over-the-shoulder',
  CloseUp = 'close-up',
  ExtremeCloseUp = 'extreme-close-up',
  MediumShot = 'medium-shot',
  LongShot = 'long-shot',
  WideShot = 'wide-shot',
}

export enum LightingStyle {
  Studio = 'studio',
  Cinematic = 'cinematic',
  GoldenHour = 'golden-hour',
  BlueHour = 'blue-hour',
  HighKey = 'high-key',
  LowKey = 'low-key',
  Backlight = 'backlight',
  RimLight = 'rim-light',
  HardLight = 'hard-light',
  SoftLight = 'soft-light',
}


export interface ImageFile {
  base64: string;
  mimeType: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16';