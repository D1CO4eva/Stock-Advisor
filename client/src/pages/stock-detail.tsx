import Layout from "@/components/layout";
import MarketChart from "@/components/market-chart";
import { useStockData } from "@/hooks/use-stock-data";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BrainCircuit, TrendingUp, DollarSign, Activity, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function StockDetail() {
  const [match, params] = useRoute("/stock/:symbol");
  const symbol = params?.symbol;
  const { data: stocks } = useStockData();
  const stock = stocks?.find(s => s.symbol === symbol) || stocks?.[0];

  if (!stock) return <Layout><div>Loading...</div></Layout>;

  const AnalysisMetric = ({ label, value, type = "neutral", max = 100 }: { label: string, value: string | number, type?: "good" | "bad" | "neutral", max?: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{value}</span>
      </div>
      {typeof value === 'number' && (
        <Progress 
          value={(value / max) * 100} 
          className={cn("h-1.5", 
            type === "good" ? "[&>div]:bg-green-500" : 
            type === "bad" ? "[&>div]:bg-red-500" : "[&>div]:bg-primary"
          )} 
        />
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <Link href="/">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </div>
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-display font-bold">{stock.symbol}</h1>
              <Badge variant="outline" className="text-lg py-1 px-3 border-border bg-card/50">
                {stock.sector}
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground">{stock.name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold">${stock.price.toFixed(2)}</div>
            <div className={cn("flex items-center justify-end gap-1 font-mono font-medium", stock.change >= 0 ? "text-green-500" : "text-red-500")}>
              {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
              {stock.change >= 0 ? "+" : ""}{stock.change} ({stock.changePercent}%)
            </div>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <Card className="bg-gradient-to-r from-card to-card/50 border-primary/20 shadow-lg shadow-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-sm uppercase">
                  <BrainCircuit className="w-4 h-4" />
                  AI Recommendation Engine
                </div>
                <h2 className="text-3xl font-display font-bold text-white">
                  Strong {stock.recommendation} Signal
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  {stock.description} Our hybrid model detects a convergence of {stock.fundamentalSignal.toLowerCase()} fundamentals and {stock.technicalSignal.toLowerCase()} technical momentum.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-xl border border-border min-w-[150px]">
                <span className="text-sm text-muted-foreground mb-1">Confidence Score</span>
                <span className={cn("text-5xl font-display font-bold mb-2", 
                  stock.score > 80 ? "text-green-500" : "text-yellow-500"
                )}>{stock.score}</span>
                <Badge variant={stock.score > 80 ? "default" : "secondary"}>
                  Very High
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Chart & Technicals */}
          <div className="lg:col-span-2 space-y-6">
            <MarketChart symbol={stock.symbol} />
            
            <Tabs defaultValue="technical" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
                <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
                <TabsTrigger value="fundamental">Fundamental Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="technical" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-card/50 border-border">
                    <CardHeader><CardTitle className="text-sm">Trend Indicators</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <AnalysisMetric label="RSI (14)" value={42} max={100} type="neutral" />
                      <AnalysisMetric label="MACD" value="Bullish Crossover" type="good" />
                      <AnalysisMetric label="Moving Avg (50d)" value="Above" type="good" />
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-border">
                    <CardHeader><CardTitle className="text-sm">Momentum</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <AnalysisMetric label="Volume Trend" value="Increasing" type="good" />
                      <AnalysisMetric label="Volatility" value="Low" type="good" />
                      <AnalysisMetric label="Support Level" value={`$${(stock.price * 0.9).toFixed(2)}`} />
                    </CardContent>
                  </Card>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <strong className="text-primary block mb-1">AI Technical Summary:</strong>
                  Price action indicates a potential breakout pattern. Volume is accumulating, suggesting institutional interest. RSI is neutral, leaving room for upside.
                </div>
              </TabsContent>

              <TabsContent value="fundamental" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-card/50 border-border">
                    <CardHeader><CardTitle className="text-sm">Valuation</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <AnalysisMetric label="P/E Ratio" value={stock.peRatio} max={50} type="neutral" />
                      <AnalysisMetric label="PEG Ratio" value={1.2} max={3} type="good" />
                      <AnalysisMetric label="Market Cap" value={stock.marketCap} />
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-border">
                    <CardHeader><CardTitle className="text-sm">Growth & Health</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <AnalysisMetric label="Revenue Growth" value="+15.2%" type="good" />
                      <AnalysisMetric label="Net Margin" value="24.5%" type="good" />
                      <AnalysisMetric label="Debt/Equity" value={0.45} max={2} type="good" />
                    </CardContent>
                  </Card>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <strong className="text-primary block mb-1">AI Fundamental Summary:</strong>
                  Company shows robust balance sheet with healthy cash flow. Current valuation is justified by strong earnings growth projections. Sector tailwinds are favorable.
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Stats & Actions */}
          <div className="space-y-6">
             <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Open</span>
                  <span className="font-mono">${(stock.price - 1.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">High</span>
                  <span className="font-mono">${(stock.price + 2.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Low</span>
                  <span className="font-mono">${(stock.price - 2.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Vol</span>
                  <span className="font-mono">{stock.volume}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">52W High</span>
                  <span className="font-mono">${(stock.price * 1.2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">52W Low</span>
                  <span className="font-mono">${(stock.price * 0.7).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <div className="text-sm text-muted-foreground mb-1">Analyst Target</div>
                <div className="text-xl font-bold text-green-500">${(stock.price * 1.15).toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                <div className="text-sm text-muted-foreground mb-1">Bear Case</div>
                <div className="text-xl font-bold text-red-500">${(stock.price * 0.85).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
