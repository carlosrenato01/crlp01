
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Mode, EditFunction, ImageStyle, AspectRatio, CameraAngle, LightingStyle } from './types';
import type { ImageFile } from './types';
import { EDIT_FUNCTIONS, STYLE_OPTIONS, ASPECT_RATIOS, CAMERA_ANGLES, LIGHTING_STYLES } from './constants';
import { geminiService } from './services/geminiService';

// To avoid re-definition on every render, helper components are defined outside the main component.
interface FunctionCardProps {
    'data-function': string;
    className: string;
    onClick: () => void;
    children: React.ReactNode;
}
const FunctionCard: React.FC<FunctionCardProps> = (props) => {
    return (
        <div {...props}>
            {props.children}
        </div>
    );
}

// Inpainting Editor Component
interface ImageMaskEditorProps {
    imageSrc: string;
    onMaskChange: (maskFile: ImageFile | null) => void;
    key: string;
    title: string;
}
const ImageMaskEditor: React.FC<ImageMaskEditorProps> = ({ imageSrc, onMaskChange, title }) => {
    const imageCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(30);
    const [isErasing, setIsErasing] = useState(false);

    useEffect(() => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = imageCanvasRef.current;
            const maskCanvas = maskCanvasRef.current;
            if (canvas && maskCanvas) {
                const aspectRatio = image.width / image.height;
                const maxWidth = canvas.parentElement?.clientWidth || 300;
                const width = maxWidth;
                const height = width / aspectRatio;
                canvas.width = width;
                canvas.height = height;
                maskCanvas.width = width;
                maskCanvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(image, 0, 0, width, height);
            }
        };
    }, [imageSrc]);

    const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent | React.TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const touch = (evt as React.TouchEvent).touches?.[0];
        const clientX = touch ? touch.clientX : (evt as React.MouseEvent).clientX;
        const clientY = touch ? touch.clientY : (evt as React.MouseEvent).clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = maskCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { x, y } = getMousePos(canvas, e);

        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
        ctx.fillStyle = 'rgba(0, 150, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    };
    
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const maskCanvas = maskCanvasRef.current;
        if (!maskCanvas) return;
        
        // Create the final black and white mask
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = maskCanvas.width;
        exportCanvas.height = maskCanvas.height;
        const exportCtx = exportCanvas.getContext('2d');
        if (!exportCtx) return;

        exportCtx.drawImage(maskCanvas, 0, 0);
        const imageData = exportCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // If pixel from mask is not transparent
                data[i] = 255;     // R
                data[i + 1] = 255; // G
                data[i + 2] = 255; // B
            } else { // if transparent
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
            }
            data[i + 3] = 255; // Make mask fully opaque
        }
        exportCtx.putImageData(imageData, 0, 0);

        const dataUrl = exportCanvas.toDataURL('image/png');
        const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
        onMaskChange({ base64, mimeType: 'image/png' });
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="text-base font-semibold text-gray-300">{title}</div>
            <div className="relative w-full cursor-crosshair">
                <canvas ref={imageCanvasRef} className="rounded-lg w-full" />
                <canvas 
                    ref={maskCanvasRef} 
                    className="absolute top-0 left-0 w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
             <div className="flex flex-col gap-2 p-2 bg-black/20 backdrop-blur-sm rounded-md">
                <div className="flex items-center gap-2">
                    <label htmlFor="brushSize" className="text-sm">Pincel:</label>
                    <input type="range" id="brushSize" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full" />
                </div>
                <button onClick={() => setIsErasing(!isErasing)} className={`w-full p-2 rounded-md text-sm ${isErasing ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    {isErasing ? 'Borracha' : 'Pincel'}
                </button>
             </div>
        </div>
    );
}

interface CameraCaptureProps {
    onCapture: (imageFile: ImageFile) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    activeStream = mediaStream;
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } else {
                    setError("Seu navegador não suporta acesso à câmera.");
                }
            } catch (err) {
                console.error("Erro ao acessar a câmera:", err);
                setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
            }
        };

        startCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            const dataUrl = canvas.toDataURL('image/png');
            const mimeType = 'image/png';
            const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
            onCapture({ base64, mimeType });
            onClose();
        }
    };
    
    if (error) {
        return (
             <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-50">
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Fechar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-2xl">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg shadow-2xl"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <div className="mt-6 flex gap-4">
                <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition">Cancelar</button>
                <button onClick={handleCapture} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition">
                    📸 Capturar
                </button>
            </div>
        </div>
    );
};

interface ImageCompareSliderProps {
    beforeSrc: string;
    afterSrc: string;
}

const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({ beforeSrc, afterSrc }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const onMouseMove = (moveEvent: MouseEvent) => handleMove(moveEvent.clientX);
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [handleMove]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const onTouchMove = (moveEvent: TouchEvent) => handleMove(moveEvent.touches[0].clientX);
        const onTouchEnd = () => {
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onTouchEnd);
    }, [handleMove]);

    return (
        <div ref={containerRef} className="relative w-full h-full select-none" style={{ userSelect: 'none' }}>
            <div className="absolute inset-0 bg-no-repeat bg-center rounded-lg" style={{ backgroundImage: `url(${beforeSrc})`, backgroundSize: 'contain' }}>
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Antes</div>
            </div>
            <div className="absolute inset-0 bg-no-repeat bg-center rounded-lg" style={{ backgroundImage: `url(${afterSrc})`, backgroundSize: 'contain', clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}>
                 <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Depois</div>
            </div>
            <div
                className="absolute top-0 bottom-0 -ml-0.5 w-1 bg-white/80 shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="absolute top-1/2 -mt-5 -ml-5 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-2xl text-gray-600 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18m0 0l4 4m-4-4l-4 4" transform="rotate(90 12 12)" /></svg>
                </div>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [mode, setMode] = useState<Mode>(Mode.Create);
    const [editFunction, setEditFunction] = useState<EditFunction>(EditFunction.Retouch);
    const [selectedStyle, setSelectedStyle] = useState<ImageStyle | null>(ImageStyle.Realistic);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [cameraAngle, setCameraAngle] = useState<CameraAngle | null>(null);
    const [lightingStyle, setLightingStyle] = useState<LightingStyle | null>(null);
    const [expansionAspectRatio, setExpansionAspectRatio] = useState<AspectRatio | null>(null);
    const [image1, setImage1] = useState<ImageFile | null>(null);
    const [combineImages, setCombineImages] = useState<(ImageFile | null)[]>(Array(4).fill(null));
    const [maskImage, setMaskImage] = useState<ImageFile | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCombineView, setShowCombineView] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [editHistory, setEditHistory] = useState<{ undo: string[], redo: string[] }>({ undo: [], redo: [] });
    const [cameraForSlot, setCameraForSlot] = useState<number | 'single' | null>(null);
    const [originalForCompare, setOriginalForCompare] = useState<ImageFile | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    
    // Sticker specific options
    const [stickerBorderStyle, setStickerBorderStyle] = useState<'outline' | 'dashed' | 'none'>('outline');
    const [stickerHasShadow, setStickerHasShadow] = useState(false);
    const [stickerBackgroundType, setStickerBackgroundType] = useState<'transparent' | 'solid'>('transparent');
    const [stickerBackgroundColor, setStickerBackgroundColor] = useState('#FFFFFF');

    // Zoom and Pan state
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startDragPos = useRef({ x: 0, y: 0 });


     useEffect(() => {
        if (editFunction !== EditFunction.Expand) {
            setExpansionAspectRatio(null);
        }
    }, [editFunction]);
    
    const resetCompare = useCallback(() => {
        setOriginalForCompare(null);
        setIsComparing(false);
    }, []);
    
    const resetEditHistory = () => {
        setEditHistory({ undo: [], redo: [] });
    };

    const resetImageView = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setIsDragging(false);
    };
    
    const handleImageFile = (imageFile: ImageFile, imageSlot: 'single' | number) => {
        if (typeof imageSlot === 'number') {
            const newCombineImages = [...combineImages];
            newCombineImages[imageSlot] = imageFile;
            setCombineImages(newCombineImages);
        } else { // single
            setImage1(imageFile);
            setCombineImages(Array(4).fill(null));
        }

        setMaskImage(null); // Reset mask on new image
        resetEditHistory(); // New image starts a new session
        resetCompare();
    };


    const handleImageUpload = (input: HTMLInputElement, imageSlot: 'single' | number) => {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
                const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
                const imageFile = { base64, mimeType };
                handleImageFile(imageFile, imageSlot);
            };
            reader.readAsDataURL(file);
        }
        // Clear input value to allow re-uploading the same file
        input.value = '';
    };
    
    const createPaddedImage = (imageFile: ImageFile, targetRatio: AspectRatio): Promise<ImageFile> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = `data:${imageFile.mimeType};base64,${imageFile.base64}`;
            img.onload = () => {
                const originalWidth = img.width;
                const originalHeight = img.height;

                let newWidth, newHeight;
                const [targetW, targetH] = targetRatio.split(':').map(Number);
                const targetAspectRatioVal = targetW / targetH;
                const originalAspectRatio = originalWidth / originalHeight;

                if (targetAspectRatioVal > originalAspectRatio) {
                    newHeight = originalHeight;
                    newWidth = newHeight * targetAspectRatioVal;
                } else {
                    newWidth = originalWidth;
                    newHeight = newWidth / targetAspectRatioVal;
                }

                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error("Could not get canvas context"));
                }
                
                const x = (newWidth - originalWidth) / 2;
                const y = (newHeight - originalHeight) / 2;
                ctx.drawImage(img, x, y, originalWidth, originalHeight);
                
                const dataUrl = canvas.toDataURL('image/png');
                const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
                resolve({ base64, mimeType: 'image/png' });
            };
            img.onerror = (err) => {
                reject(err);
            };
        });
    };

    const generateImage = async () => {
        if (isLoading) return;
        setError(null);
        resetCompare();

        const promptOptionalInEdit: EditFunction[] = [EditFunction.Expand, EditFunction.Restore, EditFunction.Colorize, EditFunction.RemoveWatermark, EditFunction.BackgroundRemoval];
        const isPromptOptional = mode === Mode.Edit && promptOptionalInEdit.includes(editFunction);

        if (!prompt.trim() && !isPromptOptional) {
            setError("Por favor, descreva sua ideia.");
            return;
        }

        if (mode === Mode.Edit && editFunction !== EditFunction.Expand && !showCombineView && !image1) {
            setError("Por favor, envie uma imagem para editar.");
            return;
        }
         if (mode === Mode.Edit && editFunction === EditFunction.Expand && !image1) {
            setError("Por favor, envie uma imagem para expandir.");
            return;
        }
        if (mode === Mode.Edit && editFunction === EditFunction.ControlNet && !image1) {
            setError("Por favor, envie uma imagem de referência para a pose.");
            return;
        }
        if (mode === Mode.Edit && editFunction === EditFunction.Expand && !expansionAspectRatio) {
            setError("Por favor, escolha uma proporção para expandir a imagem.");
            return;
        }
        if (mode === Mode.Edit && editFunction === EditFunction.Inpainting && !maskImage) {
            setError("Por favor, pinte a área que deseja alterar na imagem.");
            return;
        }
        if (mode === Mode.Edit && showCombineView) {
            const validImages = combineImages.filter(Boolean);
            if (validImages.length < 2) {
                setError("Por favor, envie pelo menos duas imagens para combinar.");
                return;
            }
        }

        setIsLoading(true);
        setGeneratedImage(null);

        try {
            let resultBase64: string | null = null;
            if (mode === Mode.Create) {
                resetCompare();
                let basePrompt = prompt;

                if (cameraAngle) {
                    const angleData = CAMERA_ANGLES.find(a => a.id === cameraAngle);
                    if (angleData) basePrompt += angleData.description;
                }

                if (lightingStyle) {
                    const lightingData = LIGHTING_STYLES.find(l => l.id === lightingStyle);
                    if (lightingData) basePrompt += lightingData.description;
                }

                let finalPrompt = basePrompt;
                if (selectedStyle) {
                    switch (selectedStyle) {
                        case ImageStyle.Realistic: finalPrompt = `${basePrompt}, in a realistic photographic style, high detail, 4k`; break;
                        case ImageStyle.Anime: finalPrompt = `${basePrompt}, in a vibrant anime and manga style, cel shading`; break;
                        case ImageStyle.Watercolor: finalPrompt = `${basePrompt}, as a beautiful watercolor painting, soft edges`; break;
                        case ImageStyle.BlackAndWhite: finalPrompt = `${basePrompt}, in a dramatic black and white photograph, monochrome, high contrast`; break;
                        case ImageStyle.Ghibli: finalPrompt = `${basePrompt}, in the style of Studio Ghibli, hand-drawn, whimsical, detailed backgrounds, soft painterly look`; break;
                        case ImageStyle.Pixar: finalPrompt = `${basePrompt}, in the style of a 3D Pixar animated movie, vibrant colors, expressive characters, detailed textures, rendered in 3D`; break;
                        case ImageStyle.Cyberpunk: finalPrompt = `${basePrompt}, in a futuristic cyberpunk style, neon lights, dystopian city, high-tech, gritty atmosphere, cinematic lighting`; break;
                        case ImageStyle.Vaporwave: finalPrompt = `${basePrompt}, in a vaporwave aesthetic, pastel pink and blue color palette, retro 80s and 90s style, grid lines, roman statues, nostalgic feel`; break;
                        case ImageStyle.LineArt: finalPrompt = `${basePrompt}, as a clean black and white line art drawing, minimalist, contour lines, no shading, vector style`; break;
                        case ImageStyle.Sticker:
                            let stickerPrompt = `A cute die-cut sticker of ${basePrompt}, high quality vector art`;
                            switch (stickerBorderStyle) {
                                case 'outline':
                                    stickerPrompt += ', with a thick white vinyl die-cut border';
                                    break;
                                case 'dashed':
                                    stickerPrompt += ', with a dashed cut line around it';
                                    break;
                            }
                            if (stickerHasShadow) {
                                stickerPrompt += ', with a subtle drop shadow effect';
                            }
                            if (stickerBackgroundType === 'transparent') {
                                stickerPrompt += ', on a plain white background for easy cutting';
                            } else {
                                stickerPrompt += `, on a solid ${stickerBackgroundColor} background`;
                            }
                            finalPrompt = stickerPrompt;
                            break;
                        case ImageStyle.Logo: finalPrompt = `minimalist vector logo for ${basePrompt}, simple, clean, flat design, on a white background`; break;
                        case ImageStyle.Comic: finalPrompt = `${basePrompt}, in a vibrant comic book art style, bold outlines, cel shading, dynamic action scene`; break;
                        case ImageStyle.FantasyArt: finalPrompt = `${basePrompt}, epic fantasy art, mythical, magical, highly detailed, digital painting, trending on ArtStation`; break;
                        case ImageStyle.Sketch: finalPrompt = `${basePrompt}, as a detailed pencil sketch, hand-drawn, charcoal shading, sketchbook style`; break;
                        case ImageStyle.Abstract: finalPrompt = `${basePrompt}, abstract art, non-representational, vibrant colors, geometric shapes, expressionism`; break;
                        case ImageStyle.Cinematic: finalPrompt = `${basePrompt}, cinematic movie still, dramatic lighting, high detail, photorealistic, wide angle shot, 8k`; break;
                    }
                }
                resultBase64 = await geminiService.generateImage(finalPrompt, aspectRatio);
            } else { // Mode.Edit
                let originalImageForEdit: ImageFile | null = null;
                if (editFunction === EditFunction.Compose) {
                    originalImageForEdit = combineImages.find(Boolean) as ImageFile | null;
                } else if (image1) {
                    originalImageForEdit = image1;
                }
                if (originalImageForEdit) setOriginalForCompare(originalImageForEdit);

                if (editFunction === EditFunction.ControlNet && image1) {
                    const controlNetPrompt = `Create an image of: "${prompt}". The subject in the generated image must strictly follow the pose of the person in the provided reference image.`;
                    resultBase64 = await geminiService.editImage(controlNetPrompt, [image1]);
                } else if (editFunction === EditFunction.Expand && image1 && expansionAspectRatio) {
                    const paddedImage = await createPaddedImage(image1, expansionAspectRatio);
                    const expansionPrompt = `Fill the transparent areas to naturally expand this image. ${prompt || 'Expand the scene logically.'}`;
                    resultBase64 = await geminiService.editImage(expansionPrompt, [paddedImage]);
                } else if (editFunction === EditFunction.Inpainting && image1 && maskImage) {
                    resultBase64 = await geminiService.editImage(prompt, [image1], maskImage);
                } else if (editFunction === EditFunction.Compose) {
                     const validImages = combineImages.filter(Boolean) as ImageFile[];
                     resultBase64 = await geminiService.editImage(prompt, validImages);
                } else if (editFunction === EditFunction.Restore && image1) {
                    const restorePrompt = `Restaure esta foto antiga e danificada. Remova arranhões, manchas, rasgos, melhore a nitidez e a qualidade geral da imagem, consertando quaisquer imperfeições. ${prompt}`;
                    resultBase64 = await geminiService.editImage(restorePrompt, [image1]);
                } else if (editFunction === EditFunction.Colorize && image1) {
                    const colorizePrompt = `Colorize esta foto antiga (preto e branco ou sépia) com cores realistas e naturais, prestando atenção aos detalhes para um resultado autêntico. ${prompt}`;
                    resultBase64 = await geminiService.editImage(colorizePrompt, [image1]);
                } else if (editFunction === EditFunction.RemoveWatermark && image1) {
                    const removeWatermarkPrompt = `Analise esta imagem para identificar e remover completamente quaisquer marcas d'água, sejam logotipos nos cantos, padrões repetidos ou sobreposições de texto. Reconstrua as áreas atrás das marcas d'água para combinar perfeitamente com o resto da imagem, preservando a qualidade, os detalhes e o estilo originais. O resultado final deve ser uma versão limpa da imagem, sem vestígios da marca d'água. ${prompt}`;
                    resultBase64 = await geminiService.editImage(removeWatermarkPrompt, [image1]);
                } else if (editFunction === EditFunction.BackgroundRemoval && image1) {
                    const removeBgPrompt = `Remove the background of this image. The main subject should be perfectly cutout with clean edges. The background must be transparent.`;
                    resultBase64 = await geminiService.editImage(removeBgPrompt, [image1]);
                } else if (editFunction === EditFunction.SelectiveColor && image1) {
                    const selectiveColorPrompt = `Perform a selective color change on this image based on the user's request: "${prompt}". Identify the object and its color as described, and change it to the new color. Preserve textures, shadows, highlights, and details. The rest of the image must remain unchanged.`;
                    resultBase64 = await geminiService.editImage(selectiveColorPrompt, [image1]);
                } else if (image1) {
                    resultBase64 = await geminiService.editImage(prompt, [image1]);
                }
            }

            if (resultBase64) {
                const finalImage = `data:image/png;base64,${resultBase64}`;
                
                setEditHistory(prev => ({
                    undo: [...prev.undo, generatedImage].filter(Boolean) as string[],
                    redo: [],
                }));
                
                setGeneratedImage(finalImage);
                resetImageView();
                setHistory(prev => [finalImage, ...prev]);
                if (window.innerWidth < 768) setIsModalOpen(true);
            } else {
                throw new Error("A IA não retornou uma imagem. Tente novamente.");
            }
        } catch (e: any) {
            setError(e.message || 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHistoryClick = (imageUrl: string) => {
        setGeneratedImage(imageUrl);
        resetImageView();
        resetCompare();
        setIsLoading(false);
        setError(null);
        if (window.innerWidth < 768) {
            setIsModalOpen(true);
        }
    };

    const downloadImage = useCallback(() => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `ai-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [generatedImage]);

    const editCurrentImage = () => {
        if (!generatedImage) return;
        const mimeType = generatedImage.substring(generatedImage.indexOf(':') + 1, generatedImage.indexOf(';'));
        const base64 = generatedImage.substring(generatedImage.indexOf(',') + 1);

        setMode(Mode.Edit);
        setEditFunction(EditFunction.Retouch);
        setImage1({ base64, mimeType });
        setCombineImages(Array(4).fill(null));
        setMaskImage(null);
        setShowCombineView(false);
        resetEditHistory();
        resetImageView();
        resetCompare();
    };

    const handleUndo = () => {
        if (editHistory.undo.length === 0) return;

        const lastState = editHistory.undo[editHistory.undo.length - 1];
        const newUndoStack = editHistory.undo.slice(0, -1);

        setEditHistory({
            undo: newUndoStack,
            redo: [generatedImage!, ...editHistory.redo],
        });

        setGeneratedImage(lastState);
        resetImageView();
    };

    const handleRedo = () => {
        if (editHistory.redo.length === 0) return;

        const nextState = editHistory.redo[0];
        const newRedoStack = editHistory.redo.slice(1);

        setEditHistory({
            undo: [...editHistory.undo, generatedImage!],
            redo: newRedoStack,
        });

        setGeneratedImage(nextState);
        resetImageView();
    };

    const exitCombineView = () => {
        setShowCombineView(false);
    };
    
    const selectMode = (newMode: Mode) => {
        if (mode === newMode) return;
        setMode(newMode);
        setGeneratedImage(null);
        setImage1(null);
        setCombineImages(Array(4).fill(null));
        setPrompt('');
        setCameraAngle(null);
        setLightingStyle(null);
        resetEditHistory();
        resetImageView();
        resetCompare();
        setError(null);
    };

    const clearPreview = (imageSlot: 'single' | number) => {
         if (typeof imageSlot === 'number') {
            const newCombineImages = [...combineImages];
            newCombineImages[imageSlot] = null;
            setCombineImages(newCombineImages);
        } else { // single
            setImage1(null);
        }
        setMaskImage(null);
        resetEditHistory();
    };
    
    // Modal handlers
    const editFromModal = () => { editCurrentImage(); setIsModalOpen(false); }
    const downloadFromModal = () => { downloadImage(); }
    const newImageFromModal = () => {
        setGeneratedImage(null);
        resetEditHistory();
        resetImageView();
        resetCompare();
        setIsModalOpen(false);
    }
    
    // Zoom and Pan Handlers
    const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta = e.deltaY * -0.005;
        const newScale = Math.min(Math.max(0.25, scale + delta * scale), 10);

        const newX = mouseX - (mouseX - position.x) * (newScale / scale);
        const newY = mouseY - (mouseY - position.y) * (newScale / scale);

        setPosition({ x: newX, y: newY });
        setScale(newScale);
    };

    const getEventCoords = (e: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>) => {
        if ('touches' in e) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    const handlePanStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (scale <= 1 || isComparing) return;
        e.preventDefault();
        const coords = getEventCoords(e);
        startDragPos.current = {
            x: coords.x - position.x,
            y: coords.y - position.y
        };
        setIsDragging(true);
    };

    const handlePanMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging || isComparing) return;
        e.preventDefault();
        const coords = getEventCoords(e);
        const newX = coords.x - startDragPos.current.x;
        const newY = coords.y - startDragPos.current.y;
        setPosition({ x: newX, y: newY });
    };

    const handlePanEnd = () => {
        setIsDragging(false);
    };


    const needsMask = editFunction === EditFunction.Inpainting;
    const isPromptHidden = mode === Mode.Edit && editFunction === EditFunction.BackgroundRemoval;
    
    let promptPlaceholder = "Descreva a imagem que você deseja criar...";
    if (mode === Mode.Edit && !isPromptHidden) {
        switch (editFunction) {
            case EditFunction.Inpainting:
                promptPlaceholder = "Descreva o que adicionar na área pintada...";
                break;
            case EditFunction.SelectiveColor:
                promptPlaceholder = "Ex: Mude a cor do vestido de azul para vermelho";
                break;
            case EditFunction.Retouch:
                 promptPlaceholder = "Ex: Adicione um chapéu na pessoa; Remova o poste...";
                 break;
            case EditFunction.ControlNet:
                promptPlaceholder = "Ex: um astronauta surfando numa onda cósmica";
                break;
            default:
                 promptPlaceholder = "Opcional: adicione mais instruções...";
                 break;
        }
    }
    
    return (
        <div className="container mx-auto flex flex-col md:flex-row min-h-screen font-sans text-gray-200">
            {/* LEFT PANEL */}
            <div className="left-panel w-full md:w-1/3 lg:w-[400px] p-6 flex flex-col gap-5 border-r border-gray-700 h-screen overflow-y-auto">
                <header>
                    <h1 className="panel-title text-2xl font-bold text-white">🎨 Pi AI Studio</h1>
                    <p className="panel-subtitle text-sm text-gray-400">Gerador - Editor de Imagens</p>
                </header>
                
                <div className="mode-toggle flex bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-gray-700">
                    <button data-mode="create" className={`mode-btn flex-1 py-2 rounded-md transition-all duration-200 text-sm font-medium ${mode === 'create' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`} onClick={() => selectMode(Mode.Create)}>Criar</button>
                    <button data-mode="edit" className={`mode-btn flex-1 py-2 rounded-md transition-all duration-200 text-sm font-medium ${mode === 'edit' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`} onClick={() => selectMode(Mode.Edit)}>Editar</button>
                </div>
                
                {!isPromptHidden && (
                    <div className="prompt-section">
                        <div className="section-title text-base font-semibold mb-2 text-gray-300">💭 Descreva sua ideia</div>
                        <div className="relative w-full">
                            <textarea
                                id="prompt"
                                className="prompt-input w-full bg-black/20 backdrop-blur-sm border border-gray-600 rounded-md p-3 pr-8 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none h-28"
                                placeholder={promptPlaceholder}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            ></textarea>
                             {prompt && (
                                <button
                                    onClick={() => setPrompt('')}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                                    title="Limpar prompt"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}
                
                {mode === Mode.Create && (
                    <>
                        <div className="flex flex-col gap-2">
                            <div className="section-title text-base font-semibold text-gray-300">📐 Proporção da Imagem</div>
                            <div className="flex bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-gray-700">
                                {ASPECT_RATIOS.map(ratio => (
                                    <button
                                        key={ratio.id}
                                        className={`flex-1 py-2 rounded-md transition-all duration-200 text-sm font-medium ${aspectRatio === ratio.id ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`}
                                        onClick={() => setAspectRatio(ratio.id)}
                                    >
                                        {ratio.name} <span className="text-gray-400">({ratio.id})</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="section-title text-base font-semibold text-gray-300">📷 Ângulo da Câmera</div>
                            <div className="relative">
                                <select
                                    id="cameraAngle"
                                    value={cameraAngle || ''}
                                    onChange={(e) => setCameraAngle(e.target.value as CameraAngle || null)}
                                    className="w-full bg-black/20 backdrop-blur-sm border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Padrão</option>
                                    {CAMERA_ANGLES.map(angle => (
                                        <option key={angle.id} value={angle.id}>{angle.name}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="section-title text-base font-semibold text-gray-300">💡 Estilo de Iluminação</div>
                            <div className="relative">
                                <select
                                    id="lightingStyle"
                                    value={lightingStyle || ''}
                                    onChange={(e) => setLightingStyle(e.target.value as LightingStyle || null)}
                                    className="w-full bg-black/20 backdrop-blur-sm border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Padrão</option>
                                    {LIGHTING_STYLES.map(style => (
                                        <option key={style.id} value={style.id}>{style.name}</option>
                                    ))}
                                </select>
                                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div id="styleOptions" className="functions-section">
                            <div className="section-title text-base font-semibold mb-2 text-gray-300">🎨 Escolha um Estilo</div>
                            <div className="style-grid grid grid-cols-4 gap-2">
                                {STYLE_OPTIONS.map(style => (
                                    <button
                                        key={style.id}
                                        className={`style-btn p-2 bg-white/5 backdrop-blur-sm border rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-1 aspect-square ${selectedStyle === style.id ? style.classes.selected : style.classes.base}`}
                                        onClick={() => setSelectedStyle(prev => prev === style.id ? null : style.id)}
                                    >
                                        <span className="text-2xl">{style.icon}</span>
                                        <span className="text-xs font-semibold text-center">{style.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {mode === Mode.Create && selectedStyle === ImageStyle.Sticker && (
                            <div className="flex flex-col gap-4 p-3 bg-black/20 backdrop-blur-sm border border-gray-700 rounded-lg">
                                <div className="text-base font-semibold text-gray-300">Opções do Adesivo</div>
                                
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Estilo da Borda</label>
                                    <div className="flex bg-black/10 rounded-lg p-1 border border-gray-600">
                                        <button className={`flex-1 py-1 text-xs rounded-md transition-colors ${stickerBorderStyle === 'outline' ? 'bg-blue-600' : 'hover:bg-white/10'}`} onClick={() => setStickerBorderStyle('outline')}>Contorno</button>
                                        <button className={`flex-1 py-1 text-xs rounded-md transition-colors ${stickerBorderStyle === 'dashed' ? 'bg-blue-600' : 'hover:bg-white/10'}`} onClick={() => setStickerBorderStyle('dashed')}>Tracejado</button>
                                        <button className={`flex-1 py-1 text-xs rounded-md transition-colors ${stickerBorderStyle === 'none' ? 'bg-blue-600' : 'hover:bg-white/10'}`} onClick={() => setStickerBorderStyle('none')}>Nenhum</button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label htmlFor="shadow-toggle" className="text-sm font-medium">Efeito de Sombra</label>
                                    <button 
                                        id="shadow-toggle" 
                                        role="switch"
                                        aria-checked={stickerHasShadow}
                                        onClick={() => setStickerHasShadow(!stickerHasShadow)} 
                                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${stickerHasShadow ? 'bg-blue-600' : 'bg-gray-600'}`}
                                    >
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${stickerHasShadow ? 'translate-x-6' : 'translate-x-1'}`}/>
                                    </button>
                                </div>
                        
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Fundo</label>
                                    <div className="flex bg-black/10 rounded-lg p-1 border border-gray-600">
                                        <button className={`flex-1 py-1 text-xs rounded-md transition-colors ${stickerBackgroundType === 'transparent' ? 'bg-blue-600' : 'hover:bg-white/10'}`} onClick={() => setStickerBackgroundType('transparent')}>Transparente</button>
                                        <button className={`flex-1 py-1 text-xs rounded-md transition-colors ${stickerBackgroundType === 'solid' ? 'bg-blue-600' : 'hover:bg-white/10'}`} onClick={() => setStickerBackgroundType('solid')}>Cor Sólida</button>
                                    </div>
                                    {stickerBackgroundType === 'solid' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <label htmlFor="bgColor" className="text-sm">Escolha a cor:</label>
                                            <input 
                                                type="color" 
                                                id="bgColor" 
                                                value={stickerBackgroundColor} 
                                                onChange={(e) => setStickerBackgroundColor(e.target.value)} 
                                                className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
                                                style={{backgroundColor: stickerBackgroundColor}}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
                
                {mode === Mode.Edit && !showCombineView && (
                    <div id="editFunctions" className="functions-section">
                        <div className="functions-grid grid grid-cols-2 gap-3">
                            {EDIT_FUNCTIONS.map(fn => (
                                <FunctionCard key={fn.id} data-function={fn.id} className={`function-card flex flex-col items-center justify-center p-3 bg-white/5 backdrop-blur-sm border border-gray-700 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200 ${editFunction === fn.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => { setEditFunction(fn.id); if (fn.id === EditFunction.Compose) setShowCombineView(true); else setShowCombineView(false); }}>
                                    <div className="text-2xl">{fn.icon}</div>
                                    <div className="text-sm font-medium mt-1">{fn.name}</div>
                                </FunctionCard>
                            ))}
                        </div>
                    </div>
                )}
                
                {mode === Mode.Edit && showCombineView && (
                     <div id="combineImagesSection" className="functions-section flex flex-col gap-3">
                        <div className="text-base font-semibold text-gray-300">🖼️ Combinar Imagens (2 a 4)</div>
                        <div className="flex flex-col gap-3">
                            {combineImages.map((img, index) => (
                                <div key={index} className="bg-black/20 p-3 rounded-lg border border-gray-700 flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-800 rounded-md flex-shrink-0 relative group">
                                        {img ? (
                                            <>
                                                <img src={`data:${img.mimeType};base64,${img.base64}`} className="w-full h-full object-cover rounded-md" alt={`Preview ${index + 1}`}/>
                                                <button onClick={() => clearPreview(index)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl">?</div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="font-semibold text-gray-300">Imagem {index + 1}</div>
                                        {!img ? (
                                            <div className="flex items-center gap-3 mt-2">
                                                <button className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md" onClick={() => document.getElementById(`imageUpload-${index}`)?.click()}>
                                                    📁 Selecionar
                                                </button>
                                                <button className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md" onClick={() => setCameraForSlot(index)}>
                                                    📸 Câmera
                                                </button>
                                                <input type="file" id={`imageUpload-${index}`} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target as HTMLInputElement, index)} />
                                            </div>
                                        ) : (
                                          <>
                                            <p className="text-xs text-gray-400 mt-1">Imagem carregada.</p>
                                            <input type="file" id={`imageUpload-${index}`} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target as HTMLInputElement, index)} />
                                          </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="back-btn mt-2 text-sm text-blue-400 hover:underline" onClick={exitCombineView}>← Voltar para Edição</button>
                    </div>
                )}
                
                {mode === 'edit' && !showCombineView && (
                    <div className="dynamic-content mt-4">
                        {image1 && needsMask ? (
                             <ImageMaskEditor 
                                key={image1.base64} // Force re-mount on image change
                                imageSrc={`data:${image1.mimeType};base64,${image1.base64}`} 
                                onMaskChange={setMaskImage} 
                                title={"Pinte a área para alterar"}
                             />
                        ) : image1 && editFunction === EditFunction.Expand ? (
                            <div className="flex flex-col gap-3">
                                <div className="text-base font-semibold text-gray-300">Selecione a proporção para expandir</div>
                                <div className="relative group">
                                    <img src={`data:${image1.mimeType};base64,${image1.base64}`} alt="Preview for expansion" className="rounded-lg w-full object-contain max-h-32"/>
                                    <button onClick={(e) => {e.stopPropagation(); clearPreview('single')}} className="absolute top-2 right-2 bg-red-600 text-white rounded-full h-6 w-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        className={`w-full py-2 rounded-md transition-all duration-200 text-sm font-medium ${expansionAspectRatio === '16:9' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                        onClick={() => setExpansionAspectRatio('16:9')}
                                    >
                                        Expandir para Paisagem (16:9)
                                    </button>
                                    <button 
                                        className={`w-full py-2 rounded-md transition-all duration-200 text-sm font-medium ${expansionAspectRatio === '9:16' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                        onClick={() => setExpansionAspectRatio('9:16')}
                                    >
                                        Expandir para Retrato (9:16)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={`upload-area relative group p-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg text-center transition-all ${image1 ? 'has-image' : ''}`}>
                               {!image1 ? (
                                <>
                                    <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => document.getElementById('imageUpload')?.click()}>
                                        <div className="text-4xl opacity-50">📁</div>
                                        <div className="font-semibold mt-2">{editFunction === EditFunction.ControlNet ? 'Imagem de Referência (Pose)' : 'Clique para selecionar'}</div>
                                        <div className="upload-text text-xs text-gray-400">PNG, JPG, WebP</div>
                                    </div>
                                    <div className="text-gray-400 my-2">ou</div>
                                    <button
                                        onClick={() => setCameraForSlot('single')}
                                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 8a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                                        Tirar Foto
                                    </button>
                                </>
                               ) : (
                                <>
                                    <img src={`data:${image1.mimeType};base64,${image1.base64}`} className="absolute inset-0 w-full h-full object-cover rounded-lg" alt="Preview"/>
                                    <button onClick={(e) => {e.stopPropagation(); clearPreview('single')}} className="absolute top-2 right-2 bg-red-600 text-white rounded-full h-6 w-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                </>
                               )}
                                <input type="file" id="imageUpload" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target as HTMLInputElement, 'single')} />
                            </div>
                        )}
                    </div>
                )}
                
                {history.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="section-title text-base font-semibold text-gray-300">📜 Histórico</div>
                        <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-2">
                            {history.map((imgSrc, index) => (
                                <img
                                    key={index}
                                    src={imgSrc}
                                    alt={`Generated image ${index + 1}`}
                                    className="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleHistoryClick(imgSrc)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4">
                     {error && <div className="text-red-400 text-sm mb-2 text-center">{error}</div>}
                     <button id="generateBtn" className="generate-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed" onClick={generateImage} disabled={isLoading}>
                        {isLoading ? (
                           <div className="spinner w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                           <span className="btn-text">🚀 Gerar Imagem</span>
                        )}
                    </button>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel w-full md:w-2/3 lg:flex-1 p-6 flex items-center justify-center relative hidden md:flex">
                 {!generatedImage && !isLoading && (
                    <div id="resultPlaceholder" className="result-placeholder text-center text-gray-500">
                        <div className="result-placeholder-icon text-6xl">🎨</div>
                        <div className="mt-4 text-xl">Sua obra de arte aparecerá aqui</div>
                    </div>
                 )}
                 {isLoading && (
                    <div id="loadingContainer" className="loading-container text-center text-white">
                        <div className="loading-spinner w-16 h-16 border-8 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto"></div>
                        <div className="loading-text mt-4 text-xl">Gerando sua imagem...</div>
                    </div>
                 )}
                 {generatedImage && !isLoading && (
                     <div 
                        id="imageContainer" 
                        className="image-container relative w-full h-full flex items-center justify-center overflow-hidden"
                        onWheel={isComparing ? undefined : handleWheelZoom}
                        onMouseDown={isComparing ? undefined : handlePanStart}
                        onMouseMove={isComparing ? undefined : handlePanMove}
                        onMouseUp={handlePanEnd}
                        onMouseLeave={handlePanEnd}
                        onTouchStart={isComparing ? undefined : handlePanStart}
                        onTouchMove={isComparing ? undefined : handlePanMove}
                        onTouchEnd={handlePanEnd}
                     >
                        {isComparing && originalForCompare ? (
                            <ImageCompareSlider
                                beforeSrc={`data:${originalForCompare.mimeType};base64,${originalForCompare.base64}`}
                                afterSrc={generatedImage}
                            />
                        ) : (
                            <img 
                                id="generatedImage" 
                                src={generatedImage} 
                                alt="Generated Art" 
                                className="generated-image max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                    transition: isDragging ? 'none' : 'transform 0.1s linear',
                                    willChange: 'transform'
                                }}
                            />
                        )}
                        <div className="image-actions absolute top-4 right-4 flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                                {originalForCompare && (
                                    <button 
                                        className="action-btn bg-gray-800/80 hover:bg-gray-700 text-white font-bold p-2 rounded-full backdrop-blur-sm transition" 
                                        onClick={() => setIsComparing(prev => !prev)} 
                                        title={isComparing ? "Sair da Comparação" : "Comparar Antes/Depois"}
                                    >
                                        {isComparing ? '🖼️' : '🌗'}
                                    </button>
                                )}
                                <button className="action-btn bg-gray-800/80 hover:bg-gray-700 text-white font-bold p-2 rounded-full backdrop-blur-sm transition disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleUndo} disabled={editHistory.undo.length === 0} title="Desfazer">↩️</button>
                                <button className="action-btn bg-gray-800/80 hover:bg-gray-700 text-white font-bold p-2 rounded-full backdrop-blur-sm transition disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleRedo} disabled={editHistory.redo.length === 0} title="Refazer">↪️</button>
                                <button className="action-btn bg-gray-800/80 hover:bg-gray-700 text-white font-bold p-2 rounded-full backdrop-blur-sm transition" onClick={editCurrentImage} title="Editar">✏️</button>
                                <button className="action-btn bg-gray-800/80 hover:bg-gray-700 text-white font-bold p-2 rounded-full backdrop-blur-sm transition" onClick={downloadImage} title="Download">💾</button>
                            </div>
                            {!isComparing && (
                                <div className="flex gap-1 bg-gray-800/80 backdrop-blur-sm rounded-full p-1 text-lg">
                                    <button className="action-btn hover:bg-gray-700/50 text-white font-bold px-2 rounded-full transition" onClick={() => setScale(s => s * 1.2)} title="Aproximar">+</button>
                                    <button className="action-btn hover:bg-gray-700/50 text-white font-bold px-2 rounded-full transition" onClick={() => setScale(s => s / 1.2)} title="Afastar">-</button>
                                    <button className="action-btn hover:bg-gray-700/50 text-white font-bold px-2 rounded-full transition text-sm flex items-center justify-center disabled:opacity-50" onClick={resetImageView} title="Resetar Zoom" disabled={scale === 1 && position.x === 0 && position.y === 0}>⟲</button>
                                </div>
                            )}
                        </div>
                    </div>
                 )}
            </div>
            
            {/* MOBILE MODAL */}
            {isModalOpen && (
                <div id="mobileModal" className="mobile-modal fixed inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-50 md:hidden">
                    <div className="modal-content w-full max-w-lg flex flex-col items-center gap-4">
                         <div 
                            className="relative w-full max-h-[65vh] flex items-center justify-center overflow-hidden rounded-lg"
                            style={{ height: '65vh' }}
                            onWheel={isComparing ? undefined : handleWheelZoom}
                            onMouseDown={isComparing ? undefined : handlePanStart}
                            onMouseMove={isComparing ? undefined : handlePanMove}
                            onMouseUp={handlePanEnd}
                            onTouchStart={isComparing ? undefined : handlePanStart}
                            onTouchMove={isComparing ? undefined : handlePanMove}
                            onTouchEnd={handlePanEnd}
                        >
                            {isComparing && originalForCompare ? (
                                <ImageCompareSlider
                                    beforeSrc={`data:${originalForCompare.mimeType};base64,${originalForCompare.base64}`}
                                    afterSrc={generatedImage ?? ''}
                                />
                            ) : (
                                <img 
                                    id="modalImage" 
                                    src={generatedImage ?? ''} 
                                    alt="Generated Art" 
                                    className="modal-image max-w-full max-h-full object-contain rounded-lg"
                                    style={{
                                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                        transition: isDragging ? 'none' : 'transform 0.1s linear',
                                        willChange: 'transform'
                                    }}
                                />
                            )}
                        </div>

                        <div className="w-full flex justify-center gap-3">
                             <div className="flex-1 bg-gray-700 rounded-lg p-1 flex justify-around">
                                {originalForCompare && (
                                     <button className="modal-btn text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600 text-lg" onClick={() => setIsComparing(prev => !prev)}>
                                        {isComparing ? '🖼️' : '🌗'}
                                     </button>
                                )}
                                <button className="modal-btn undo text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600" onClick={handleUndo} disabled={editHistory.undo.length === 0}>↩️</button>
                                <button className="modal-btn redo text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600" onClick={handleRedo} disabled={editHistory.redo.length === 0}>↪️</button>
                                {!isComparing && (
                                    <>
                                        <button className="modal-btn zoom-in text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600" onClick={() => setScale(s => s * 1.2)}>+</button>
                                        <button className="modal-btn zoom-out text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600" onClick={() => setScale(s => s / 1.2)}>-</button>
                                        <button className="modal-btn zoom-reset text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600" onClick={resetImageView} disabled={scale === 1 && position.x === 0 && position.y === 0}>⟲</button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="modal-actions w-full flex flex-col sm:flex-row gap-3">
                             <button className="modal-btn edit flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2" onClick={editFromModal}>✏️ Editar</button>
                             <button className="modal-btn download flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2" onClick={downloadFromModal}>💾 Salvar</button>
                             <button className="modal-btn new flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2" onClick={newImageFromModal}>✨ Nova Imagem</button>
                        </div>
                    </div>
                </div>
            )}

            {cameraForSlot !== null && (
                <CameraCapture
                    onClose={() => setCameraForSlot(null)}
                    onCapture={(imageFile) => {
                        if (cameraForSlot !== null) {
                            handleImageFile(imageFile, cameraForSlot);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default App;
