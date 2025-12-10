import { useStockData } from "@/hooks/use-stock-data";
import Layout from "@/components/layout";
import StockCard from "@/components/stock-card";
import MarketChart from "@/components/market-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, TrendingUp, Activity } from "lucide-react";
import generatedImage from '@assets/generated_images/abstract_futuristic_financial_data_visualization_background.png';

export default function Dashboard() {
  const { data: stocks, isLoading } = useStockData();
  const topPicks = stocks?.filter(s => s.recommendation === "Buy").slice(0, 3) || [];
  
  return (
    <Layout>
      <div className="grid gap-8">
        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden border border-border shadow-2xl">
          <div className="absolute inset-0 z-0">
             <img src={generatedImage} alt="Background" className="w-full h-full object-cover opacity-30" />
             <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
          </div>
          
          <div className="relative z-10 p-8 md:p-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
              <Zap className="w-3 h-3" />
              AI Market Analysis Updated
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Smart Investing, <br />
              <span className="text-primary">Powered by AI.</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Our hybrid analysis engine combines technical momentum with fundamental value to identify the market's best opportunities for your portfolio.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-md rounded-lg border border-border">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Market: Bullish</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-md rounded-lg border border-border">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Volatility: Low</span>
              </div>
            </div>
          </div>
        </section>

        {/* Top AI Picks */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Top AI Recommendations
            </h2>
            <span className="text-sm text-muted-foreground">Based on hybrid analysis score</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeletons
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="h-[200px] bg-card/50 animate-pulse border-border" />
              ))
            ) : (
              topPicks.map(stock => (
                <StockCard key={stock.symbol} stock={stock} />
              ))
            )}
          </div>
        </section>

        {/* Market Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-display font-bold">Market Performance</h2>
            <MarketChart symbol="SPY" />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold">Market Pulse</h2>
            <Card className="bg-card/50 border-border h-full">
              <CardHeader>
                <CardTitle className="text-lg">Sector Rotation</CardTitle>
                <CardDescription>Leading vs Lagging Sectors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Technology", val: "+2.4%", color: "text-green-500" },
                  { name: "Healthcare", val: "+1.1%", color: "text-green-500" },
                  { name: "Energy", val: "-0.5%", color: "text-red-500" },
                  { name: "Financials", val: "+0.2%", color: "text-green-500" },
                  { name: "Real Estate", val: "-1.2%", color: "text-red-500" },
                ].map((sector) => (
                  <div key={sector.name} className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors border border-transparent hover:border-primary/20">
                    <span className="font-medium">{sector.name}</span>
                    <span className={`font-mono font-bold ${sector.color}`}>{sector.val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}
