import { Stock } from "@/lib/mock-data";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function StockCard({ stock }: { stock: Stock }) {
  const isPositive = stock.change >= 0;

  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
        <div>
          <h3 className="font-bold text-xl font-display tracking-tight text-foreground group-hover:text-primary transition-colors">
            {stock.symbol}
          </h3>
          <p className="text-sm text-muted-foreground truncate max-w-[180px]">
            {stock.name}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono font-medium text-lg text-foreground">
            ${stock.price.toFixed(2)}
          </span>
          <span className={cn("text-xs font-mono flex items-center gap-1", isPositive ? "text-green-500" : "text-red-500")}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}{stock.change} ({stock.changePercent}%)
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">AI Score</span>
            <div className="flex items-end gap-1">
              <span className={cn("text-2xl font-bold font-display", 
                stock.score >= 80 ? "text-green-500" : 
                stock.score >= 50 ? "text-yellow-500" : "text-red-500"
              )}>
                {stock.score}
              </span>
              <span className="text-xs text-muted-foreground mb-1">/100</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={cn(
              "border bg-transparent",
              stock.recommendation === "Buy" ? "border-green-500 text-green-500 bg-green-500/10" :
              stock.recommendation === "Sell" ? "border-red-500 text-red-500 bg-red-500/10" :
              "border-yellow-500 text-yellow-500 bg-yellow-500/10"
            )}>
              {stock.recommendation}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Technical</span>
            <span className={cn("font-medium", 
              stock.technicalSignal === "Bullish" ? "text-green-500" : 
              stock.technicalSignal === "Bearish" ? "text-red-500" : "text-yellow-500"
            )}>{stock.technicalSignal}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Fundamental</span>
            <span className={cn("font-medium", 
              stock.fundamentalSignal === "Strong" ? "text-green-500" : 
              stock.fundamentalSignal === "Weak" ? "text-red-500" : "text-yellow-500"
            )}>{stock.fundamentalSignal}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Link href={`/stock/${stock.symbol}`}>
          <Button className="w-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all group-hover:translate-y-[-2px]" size="sm">
            View Analysis <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
