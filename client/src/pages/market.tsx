import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MarketChart from "@/components/market-chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useMarketOverview, useMarketHistory } from "@/hooks/use-market";
import { useMemo } from "react";

export default function Market() {
  const { data: overview, isLoading: loadingOverview } = useMarketOverview();
  const { data: historyData, isLoading: loadingHistory } = useMarketHistory("SPY");

  const gainers = useMemo(() => {
    if (!overview) return [];
    return [...overview]
      .sort((a: any, b: any) => (b.dp ?? 0) - (a.dp ?? 0))
      .slice(0, 3);
  }, [overview]);

  const losers = useMemo(() => {
    if (!overview) return [];
    return [...overview]
      .sort((a: any, b: any) => (a.dp ?? 0) - (b.dp ?? 0))
      .slice(0, 3);
  }, [overview]);

  const history =
    historyData && historyData.t && historyData.c
      ? historyData.t.map((ts: number, idx: number) => ({
          date: new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          price: historyData.c[idx],
        }))
      : undefined;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Market Analysis</h1>
            <p className="text-muted-foreground">High-level view of current market momentum.</p>
          </div>
          <Badge className="gap-2">
            <Activity className="w-4 h-4" />
            Live
          </Badge>
        </div>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Index Trend (SPY)</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketChart symbol="SPY" history={history} />
            {loadingHistory && <p className="text-xs text-muted-foreground mt-2">Loading chart...</p>}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle>Top Gainers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingOverview && <p className="text-sm text-muted-foreground">Loading...</p>}
              {!loadingOverview &&
                gainers.map((item: any) => (
                  <div key={item.symbol} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span className="font-medium">{item.symbol}</span>
                    <span className="text-green-500 font-mono flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {item.dp?.toFixed(2) ?? "0.00"}%
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle>Top Losers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingOverview && <p className="text-sm text-muted-foreground">Loading...</p>}
              {!loadingOverview &&
                losers.map((item: any) => (
                  <div key={item.symbol} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span className="font-medium">{item.symbol}</span>
                    <span className="text-red-500 font-mono flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {item.dp?.toFixed(2) ?? "0.00"}%
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
