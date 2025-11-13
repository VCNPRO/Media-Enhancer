import { useEffect, useState } from "react";

export type Plan = "basic" | "premium" | "professional" | null;

export function usePlan() {
  const [plan, setPlan] = useState<Plan>(null);

  useEffect(() => {
    const p = localStorage.getItem("me_plan") as Plan | null;
    const resolved = p ?? "basic";
    console.log("[usePlan] plan from localStorage:", p, " resolved:", resolved);
    setPlan(resolved);
  }, []);

  const selectPlan = (p: Plan) => {
    console.log("[usePlan] selectPlan", p);
    localStorage.setItem("me_plan", p ?? "basic");
    setPlan(p);
  };

  return { plan, selectPlan };
}
