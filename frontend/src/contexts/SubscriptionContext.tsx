import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api';

export type UserTier = 'starter' | 'creator' | 'professional';

interface SubscriptionContextType {
  tier: UserTier;
  loading: boolean;
  subscription: any | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [tier, setTier] = useState<UserTier>('starter');
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!user) {
      setTier('starter');
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/subscriptions');

      if (response.data.success && response.data.data) {
        setTier(response.data.data.tier || 'starter');
        setSubscription(response.data.data);
      } else {
        // Usuario sin suscripción = tier starter por defecto
        setTier('starter');
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setTier('starter');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      refreshSubscription();
    }
  }, [user, isLoaded]);

  return (
    <SubscriptionContext.Provider value={{ tier, loading, subscription, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
