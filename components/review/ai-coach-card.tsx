import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { useTranslations } from "next-intl";

export function AICoachCard({ explanation }: { explanation: string }) {
  const t = useTranslations("review");

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BrainCircuit className="size-4 text-accent" />
          {t("coachTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-fg">
        {explanation}
      </CardContent>
    </Card>
  );
}
