import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-indigo-500" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {insights.map((insight) => (
          <p
            key={insight}
            className="rounded-lg border border-border/70 bg-muted/40 p-3"
          >
            {insight}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
