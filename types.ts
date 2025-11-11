export type MediaType = 'image' | 'video' | 'audio';

export interface MediaFile {
    file: File;
    name: string;
    url: string;
    type: MediaType;
    useCloud?: boolean;
}

export interface AnalysisResult {
    description: string;
    tags: string[];
    transcript?: string;
}

export interface ImageEnhancementOptions {
    colorize: boolean;
}

export interface EnhancementResult {
    originalUrl: string;
    enhancedUrl: string;
    type: MediaType;
}

export interface StoryboardFrame {
    imageUrl: string;
    description: string;
}

export interface CreativeResult {
    prompt: string;
    imageUrl: string;
}

export type HistoryItemPayload = AnalysisResult | EnhancementResult | CreativeResult | StoryboardFrame[];

export interface HistoryItem {
    id: string;
    timestamp: Date;
    type: 'analysis' | 'enhancement' | 'creative' | 'storyboard';
    mediaType: MediaType | 'none';
    payload: HistoryItemPayload;
    mediaFile?: MediaFile; // Original media file for context
}
