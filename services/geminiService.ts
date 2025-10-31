import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AnalysisResult, StoryboardFrame, ImageEnhancementOptions } from "../types";

// FIX: Initialize the GoogleGenAI client, assuming API_KEY is in environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to a Gemini Part object
const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};


export const analyzeMedia = async (file: File, prompt: string): Promise<AnalysisResult> => {
    // FIX: Use a more capable model for complex analysis.
    const model = 'gemini-2.5-pro';
    
    const filePart = await fileToGenerativePart(file);
    const textPart = { text: prompt };

    // FIX: Define a response schema for consistent JSON output.
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            description: {
                type: Type.STRING,
                description: "A detailed description of the media content.",
            },
            transcript: {
                type: Type.STRING,
                description: "A transcript of any spoken words in the media. Omit if no speech is present.",
            },
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of relevant keywords or tags for the media content.",
            },
        },
        required: ["description", "tags"],
    };

    // FIX: Use ai.models.generateContent with a structured request.
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [filePart, textPart] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    // FIX: Extract and parse the JSON response safely.
    const jsonString = response.text.trim();
    try {
        const result = JSON.parse(jsonString);
        return {
            description: result.description || "No description provided.",
            tags: result.tags || [],
            transcript: result.transcript,
        };
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonString, e);
        throw new Error("Invalid response format from the API.");
    }
};

export const enhanceImage = async (file: File, options: ImageEnhancementOptions): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    
    let prompt: string;
    if (options.colorize) {
        prompt = "Colorize this black and white image. The colors should look natural and realistic. The final output should be a high-quality, vibrant, full-color photograph.";
    } else {
        prompt = "Enhance this image: improve lighting, sharpen details, and enrich colors to make it look more professional and vibrant. Do not change the subject matter.";
    }
    
    const imagePart = await fileToGenerativePart(file);
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image was generated.");
};

export const enhanceAudio = async (file: File): Promise<string> => {
    // This is a placeholder for a hypothetical audio enhancement model.
    // We simulate this by asking the model to describe how it would enhance it,
    // then use TTS to speak that description.
    const analysisModel = 'gemini-2.5-pro';
    const ttsModel = 'gemini-2.5-flash-preview-tts';
    
    const audioPart = await fileToGenerativePart(file);
    const textPart = { text: "Analyze this audio and describe in one sentence the ideal enhancements for clarity and richness. For example: 'The audio has been enhanced by reducing background noise and boosting vocal frequencies for a clearer sound.'" };
    
    // 1. Analyze audio to get an enhancement description.
    const analysisResponse = await ai.models.generateContent({
        model: analysisModel,
        contents: [{ parts: [audioPart, textPart] }],
    });
    
    const enhancementDescription = analysisResponse.text;

    // 2. Use TTS to generate the "enhanced" audio.
    const ttsResponse = await ai.models.generateContent({
        model: ttsModel,
        contents: [{ parts: [{ text: enhancementDescription }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return base64Audio;
    }
    
    throw new Error("Failed to generate enhanced audio.");
};

export const generateImage = async (prompt: string): Promise<string> => {
    // FIX: Use the correct model for high-quality image generation.
    const model = 'imagen-4.0-generate-001';

    // FIX: Use ai.models.generateImages for Imagen models.
    const response = await ai.models.generateImages({
        model: model,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });
    
    // FIX: Extract the base64 image data correctly from the response.
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    if (base64ImageBytes) {
        return base64ImageBytes;
    }

    throw new Error("Image generation failed.");
};

export const generateStoryboard = async (videoFile: File): Promise<StoryboardFrame[]> => {
    // Step 1: Analyze the video to generate text prompts for a storyboard.
    const analysisModel = 'gemini-2.5-pro';
    const videoPart = await fileToGenerativePart(videoFile);
    
    const analysisPrompt = `Analyze the first frame of this video. Based on what you see, create a compelling 3-panel storyboard that continues the story.
    For each panel, provide a detailed visual prompt suitable for an AI image generator and a short, engaging description of the scene.
    Your response MUST be a valid JSON array of objects, where each object has "imagePrompt" and "description" keys.
    Example: [{"imagePrompt": "A futuristic cityscape at night...", "description": "The hero arrives in a new city."}]`;

    const analysisResponse = await ai.models.generateContent({
        model: analysisModel,
        contents: [{ parts: [videoPart, { text: analysisPrompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        imagePrompt: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ["imagePrompt", "description"],
                },
            },
        }
    });

    let storyboardPrompts: { imagePrompt: string; description: string }[];
    try {
        storyboardPrompts = JSON.parse(analysisResponse.text.trim());
    } catch (e) {
        console.error("Failed to parse storyboard prompts:", analysisResponse.text, e);
        throw new Error("Could not generate storyboard ideas from the video.");
    }

    // Step 2: Generate an image for each prompt.
    const imagePromises = storyboardPrompts.map(panel => generateImage(panel.imagePrompt));
    const generatedImagesBase64 = await Promise.all(imagePromises);

    // Step 3: Combine descriptions with generated images.
    const storyboardFrames: StoryboardFrame[] = storyboardPrompts.map((panel, index) => ({
        imageUrl: `data:image/jpeg;base64,${generatedImagesBase64[index]}`,
        description: panel.description,
    }));

    return storyboardFrames;
};