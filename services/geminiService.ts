

import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import type { ImageFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  generateText: async (prompt: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating text:", error);
      throw new Error("Failed to generate text with Gemini API.");
    }
  },

  generateImage: async (prompt: string, aspectRatio: string): Promise<string> => {
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
      }
      throw new Error("Image generation failed to produce an image.");
    } catch (error) {
      console.error("Error generating image:", error);
      throw new Error("Failed to generate image with Gemini API.");
    }
  },

  editImage: async (prompt: string, images: ImageFile[], mask?: ImageFile | null): Promise<string> => {
    try {
      const parts: any[] = [];

      // Add prompt first, as required by the API for editing/inpainting.
      parts.push({ text: prompt });

      // Add all main images
      images.forEach(image => {
        parts.push({
          inlineData: {
            data: image.base64,
            mimeType: image.mimeType,
          },
        });
      });
      
      // Add mask if provided for inpainting
      if (mask) {
        parts.push({
          inlineData: {
            data: mask.base64,
            mimeType: mask.mimeType,
          },
        });
      }
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: parts,
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
      throw new Error("Image editing failed to produce an image.");
    } catch (error) {
      console.error("Error editing image:", error);
      throw new Error("Failed to edit image with Gemini API.");
    }
  },
};
