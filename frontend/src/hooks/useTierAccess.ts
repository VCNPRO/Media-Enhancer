import { useSubscription } from '../contexts/SubscriptionContext';

interface TierLimits {
  maxProjects: number;
  maxVideoDuration: number; // seconds
  maxVideoTracks: number;
  maxAudioTracks: number;
  storage: number; // bytes
  maxResolution: '720p' | '1080p' | '4K';
  aiGenerations: number;
  watermark: boolean;
}

export function useTierAccess() {
  const { tier, loading } = useSubscription();

  const getTierLimits = (): TierLimits => {
    switch (tier) {
      case 'starter':
        return {
          maxProjects: 3,
          maxVideoDuration: 300, // 5 minutes
          maxVideoTracks: 1,
          maxAudioTracks: 1,
          storage: 2 * 1024 * 1024 * 1024, // 2GB
          maxResolution: '720p',
          aiGenerations: 10,
          watermark: true,
        };

      case 'creator':
        return {
          maxProjects: 25,
          maxVideoDuration: 1800, // 30 minutes
          maxVideoTracks: 3,
          maxAudioTracks: 5,
          storage: 20 * 1024 * 1024 * 1024, // 20GB
          maxResolution: '1080p',
          aiGenerations: 100,
          watermark: false,
        };

      case 'professional':
        return {
          maxProjects: Infinity,
          maxVideoDuration: Infinity,
          maxVideoTracks: Infinity,
          maxAudioTracks: Infinity,
          storage: 100 * 1024 * 1024 * 1024, // 100GB
          maxResolution: '4K',
          aiGenerations: Infinity,
          watermark: false,
        };

      default:
        return {
          maxProjects: 3,
          maxVideoDuration: 300,
          maxVideoTracks: 1,
          maxAudioTracks: 1,
          storage: 2 * 1024 * 1024 * 1024,
          maxResolution: '720p',
          aiGenerations: 10,
          watermark: true,
        };
    }
  };

  const canAccess = (feature: string): boolean => {
    const limits = getTierLimits();

    switch (feature) {
      case 'multitrack':
        return tier === 'creator' || tier === 'professional';
      case '4k':
        return tier === 'professional';
      case 'ai-unlimited':
        return tier === 'professional';
      case 'no-watermark':
        return !limits.watermark;
      default:
        return false;
    }
  };

  return {
    tier,
    loading,
    getTierLimits,
    canAccess,
  };
}
