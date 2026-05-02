import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Target } from "lucide-react";
import { useTranslations } from "next-intl";

type TrainingGoalCardProps = {
  trainingGoal: string;
  reviewId: string;
};

export function TrainingGoalCard({
  trainingGoal,
  reviewId,
}: TrainingGoalCardProps) {
  const t = useTranslations("review");

  return (
    <Card className="border-success/40 bg-success/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 text-success" />
          {t("nextGoal")}
        </CardTitle>
        <CardDescription>{t("nextGoalDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-fg">{trainingGoal}</p>
        <Button asChild className="w-full">
          <Link href={`/play?goal=${reviewId}`}>
            {t("playAgainGoal")} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
