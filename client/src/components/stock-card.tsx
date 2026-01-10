import { Stock } from "@/lib/mock-data";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToPortfolio } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StockCard({ stock }: { stock: Stock }) {
  const isPositive = stock.change >= 0;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: addToPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast({
        title: "Added to portfolio",
        description: `${stock.symbol} added with 1.00 share at $${stock.price.toFixed(2)}.`,
      });
    },
    onError: () => {
      toast({
        title: "Unable to add",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const handleQuickBuy = () => {
    const input = window.prompt(`How many shares of ${stock.symbol} would you like to buy?`, "1");
    if (!input) return;
    const qty = parseFloat(input);
    if (Number.isNaN(qty) || qty <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a positive number of shares.",
        variant: "destructive",
      });
      return;
    }
    addMutation.mutate({
      symbol: stock.symbol,
      shares: qty,
      avgCost: stock.price,
    });
  };

  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 bg-card/60 backdrop-blur-sm">
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
        <div className="flex items-center justify-between mb-4 gap-3">
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
            <Button
              variant="secondary"
              size="sm"
              disabled={addMutation.isPending}
              onClick={handleQuickBuy}
              className={cn(
                "min-w-[90px] justify-center",
                stock.recommendation === "Buy"
                  ? "bg-success/15 text-success border-success/30 hover:bg-success/25"
                  : stock.recommendation === "Sell"
                    ? "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25"
                    : "bg-muted/40 text-foreground border-muted/50 hover:bg-muted/60"
              )}
            >
              {addMutation.isPending ? "Adding..." : stock.recommendation}
            </Button>
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
