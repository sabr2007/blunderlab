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

type TrainingGoalCardProps = {
  trainingGoal: string;
};

export function TrainingGoalCard({ trainingGoal }: TrainingGoalCardProps) {
  return (
    <Card className="border-success/40 bg-success/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 text-success" />
          Next game goal
        </CardTitle>
        <CardDescription>
          One concrete focus for your next match.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-fg">{trainingGoal}</p>
        <Button asChild className="w-full">
          <Link href="/play">
            Play again with this goal <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
