import Layout from "@/components/layout";
import { useStockData } from "@/hooks/use-stock-data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPortfolio, removeFromPortfolio } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Plus, ArrowRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Portfolio() {
  const { data: stocks } = useStockData();
  const { data: portfolioData = [], isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolio,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: removeFromPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toast({
        title: "Removed",
        description: "Position removed from portfolio",
      });
    },
  });

  // Calculate portfolio values
  const portfolioItems = portfolioData.map((item) => {
    const stock = stocks?.find((s) => s.symbol === item.symbol);
    const currentPrice = stock?.price || 0;
    const totalValue = currentPrice * item.shares;
    const costBasis = item.avgCost * item.shares;
    const returnAmount = totalValue - costBasis;
    const returnPercent = ((returnAmount / costBasis) * 100);
    
    return {
      ...item,
      currentPrice,
      totalValue,
      return: returnAmount,
      returnPercent,
    };
  });

  const totalValue = portfolioItems.reduce((acc, item) => acc + item.totalValue, 0);
  const totalReturn = portfolioItems.reduce((acc, item) => acc + item.return, 0);
  const totalCostBasis = totalValue - totalReturn;
  const totalReturnPercent = totalCostBasis > 0 ? (totalReturn / totalCostBasis) * 100 : 0;

  const data = portfolioItems.map(item => ({
    name: item.symbol,
    value: item.totalValue
  }));

  const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)', '#FF8042'];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">My Portfolio</h1>
            <p className="text-muted-foreground">Track your investments and AI performance.</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Investment
          </Button>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-mono font-bold flex items-center gap-2", totalReturn >= 0 ? "text-green-500" : "text-red-500")}>
                {totalReturn >= 0 ? "+" : "-"}${Math.abs(totalReturn).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-sm font-sans bg-background/20 px-2 py-1 rounded-full">
                  {totalReturnPercent.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-primary">94/100</div>
              <p className="text-xs text-muted-foreground mt-1">Portfolio Health Score</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Holdings Table */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead>Symbol</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Return</TableHead>
                      <TableHead className="text-right">AI Rec</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Loading portfolio...
                        </TableCell>
                      </TableRow>
                    ) : portfolioItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No positions yet. Add your first investment to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      portfolioItems.map((item) => {
                        const stockInfo = stocks?.find(s => s.symbol === item.symbol);
                        return (
                          <TableRow key={item.id} className="hover:bg-primary/5 border-border group">
                            <TableCell className="font-medium">
                              <Link href={`/stock/${item.symbol}`}>
                                <div className="flex items-center gap-2 cursor-pointer">
                                  {item.symbol}
                                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell className="text-right font-mono">${item.currentPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">{item.shares}</TableCell>
                            <TableCell className="text-right font-mono">${item.totalValue.toLocaleString()}</TableCell>
                            <TableCell className={cn("text-right font-mono", item.return >= 0 ? "text-green-500" : "text-red-500")}>
                              {item.returnPercent.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className={cn(
                                "border bg-transparent ml-auto",
                                stockInfo?.recommendation === "Buy" ? "border-green-500 text-green-500 bg-green-500/10" :
                                stockInfo?.recommendation === "Sell" ? "border-red-500 text-red-500 bg-red-500/10" :
                                "border-yellow-500 text-yellow-500 bg-yellow-500/10"
                              )}>
                                {stockInfo?.recommendation || "Hold"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMutation.mutate(item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Allocation Chart */}
          <div>
            <Card className="bg-card/50 border-border h-full">
              <CardHeader>
                <CardTitle>Allocation</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{
                        backgroundColor: "hsl(222, 47%, 11%)",
                        borderColor: "hsl(215, 25%, 27%)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                      itemStyle={{ color: "hsl(217, 91%, 60%)" }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {data.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{entry.name}</span>
                      </div>
                      <span className="font-mono text-muted-foreground">{((entry.value / totalValue) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
