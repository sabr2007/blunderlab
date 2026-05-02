import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

export function AICoachCard({ explanation }: { explanation: string }) {
  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BrainCircuit className="size-4 text-accent" />
          BlunderLab Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-fg">
        {explanation}
      </CardContent>
    </Card>
  );
}
