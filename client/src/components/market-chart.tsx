import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_HISTORY_DATA } from "@/lib/mock-data";

type HistoryPoint = { date: string; price: number };

export default function MarketChart({ symbol, history }: { symbol: string; history?: HistoryPoint[] }) {
  const data = history?.length ? history : MOCK_HISTORY_DATA;

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-foreground">
          Price History <span className="text-muted-foreground text-sm ml-2">({symbol})</span>
        </CardTitle>
        <div className="flex gap-2">
          {["1D", "1W", "1M", "3M", "1Y"].map((period) => (
            <button
              key={period}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                period === "1M" 
                  ? "bg-primary/20 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[300px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.28} />
                <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--color-muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              minTickGap={30}
            />
            <YAxis 
              stroke="hsl(var(--color-muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value}`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--color-card))",
                borderColor: "hsl(var(--color-border))",
                borderRadius: "8px",
                color: "white",
              }}
              itemStyle={{ color: "hsl(var(--color-primary))" }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--color-primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
