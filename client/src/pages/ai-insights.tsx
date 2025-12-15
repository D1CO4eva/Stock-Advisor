import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";
import { useInsights } from "@/hooks/use-insights";

export default function AIInsights() {
  const { data, isLoading, error } = useInsights();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">AI Insights</h1>
            <p className="text-muted-foreground">Curated calls and cautions from live price action.</p>
          </div>
          <Badge className="gap-2">
            <Sparkles className="w-4 h-4" />
            Live
          </Badge>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading insights...</p>}
        {error && <p className="text-sm text-red-500">Failed to load insights.</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data?.insights?.map((item: any) => (
            <Card key={item.title} className="bg-card/50 border-border h-full">
              <CardHeader className="flex flex-row items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                  <Badge variant="outline" className="text-xs mt-1">
                    {item.sentiment}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
                  Change: <span className={item.changePercent > 0 ? "text-green-500" : item.changePercent < 0 ? "text-red-500" : ""}>
                    {item.changePercent?.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
