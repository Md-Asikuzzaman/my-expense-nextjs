import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="py-8">
          Loading dashboard sections...
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-8">Crunching analytics...</CardContent>
      </Card>
    </div>
  );
}
