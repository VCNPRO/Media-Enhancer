import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlanId } from '../config/plans';

interface User {
  id: string;
  email: string;
  name: string;
  planId: PlanId;
  subscriptionStatus: 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd?: Date;
}

interface UserUsage {
  storageUsed: number; // bytes
  projectsCount: number;
  exportsThisMonth: number;
  activeProcessingJobs: number;
}

interface UserStore {
  // Estado
  user: User | null;
  usage: UserUsage | null;
  isLoading: boolean;

  // Acciones
  setUser: (user: User | null) => void;
  setUsage: (usage: UserUsage) => void;
  setPlan: (planId: PlanId) => void;
  updateUsage: (updates: Partial<UserUsage>) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,
      usage: null,
      isLoading: false,

      // Acciones
      setUser: (user) => set({ user }),

      setUsage: (usage) => set({ usage }),

      setPlan: (planId) =>
        set((state) => ({
          user: state.user ? { ...state.user, planId } : null,
        })),

      updateUsage: (updates) =>
        set((state) => ({
          usage: state.usage ? { ...state.usage, ...updates } : null,
        })),

      logout: () => set({ user: null, usage: null }),
    }),
    {
      name: 'user-storage', // nombre en localStorage
      partialize: (state) => ({ user: state.user }), // solo persistir user, no usage
    }
  )
);

// Hook para obtener el plan actual del usuario
export const useCurrentPlan = () => {
  const user = useUserStore((state) => state.user);
  return user?.planId || 'basic';
};

// Hook para verificar si tiene un plan específico o superior
export const useHasPlanOrHigher = (requiredPlan: PlanId): boolean => {
  const currentPlan = useCurrentPlan();

  const planHierarchy: PlanId[] = ['basic', 'premium', 'professional'];
  const currentIndex = planHierarchy.indexOf(currentPlan);
  const requiredIndex = planHierarchy.indexOf(requiredPlan);

  return currentIndex >= requiredIndex;
};
