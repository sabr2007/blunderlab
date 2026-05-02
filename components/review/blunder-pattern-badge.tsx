import { Badge } from "@/components/ui/badge";
import type { BlunderCategory } from "@/lib/supabase/database.types";
import { useTranslations } from "next-intl";

const CATEGORY_VARIANT: Record<
  BlunderCategory,
  "danger" | "warning" | "accent"
> = {
  "Hanging Piece": "danger",
  "Missed Tactic": "warning",
  "King Safety": "danger",
  "Tunnel Vision": "warning",
  "Greedy Move": "warning",
  "Time Panic": "warning",
  "Opening Drift": "accent",
  "Endgame Technique": "accent",
};

export function BlunderPatternBadge({
  category,
}: {
  category: BlunderCategory;
}) {
  const t = useTranslations("patternLabels");

  return <Badge variant={CATEGORY_VARIANT[category]}>{t(category)}</Badge>;
}
