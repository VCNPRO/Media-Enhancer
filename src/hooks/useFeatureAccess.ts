import { useCurrentPlan } from '../store/userStore';
import { canUseFeature, getRequiredPlanForFeature, type PlanFeatures, PLANS } from '../config/plans';

interface FeatureAccessResult {
  canUse: boolean;
  requiredPlan: string | null;
  isLocked: boolean;
}

export const useFeatureAccess = (feature: keyof PlanFeatures): FeatureAccessResult => {
  const currentPlan = useCurrentPlan();

  const canUse = canUseFeature(currentPlan, feature);
  const requiredPlan = canUse ? null : getRequiredPlanForFeature(feature);

  return {
    canUse,
    requiredPlan: requiredPlan ? PLANS[requiredPlan].name : null,
    isLocked: !canUse,
  };
};

// Hook para verificar múltiples features a la vez
export const useFeaturesAccess = (features: (keyof PlanFeatures)[]): Record<string, FeatureAccessResult> => {
  const currentPlan = useCurrentPlan();

  return features.reduce((acc, feature) => {
    const canUse = canUseFeature(currentPlan, feature);
    const requiredPlan = canUse ? null : getRequiredPlanForFeature(feature);

    acc[feature] = {
      canUse,
      requiredPlan: requiredPlan ? PLANS[requiredPlan].name : null,
      isLocked: !canUse,
    };

    return acc;
  }, {} as Record<string, FeatureAccessResult>);
};

// Hook para obtener el tipo de dashboard según el plan
export const useDashboardType = (): 'basic' | 'professional' => {
  const currentPlan = useCurrentPlan();
  return PLANS[currentPlan].features.dashboardType;
};
