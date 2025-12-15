import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Flame, TrendingUp } from "lucide-react";
import { useNews } from "@/hooks/use-news";

export default function News() {
  const { data, isLoading, error } = useNews();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">News & Sentiment</h1>
            <p className="text-muted-foreground">Recent headlines with quick sentiment reads.</p>
          </div>
          <Badge className="gap-2">
            <Newspaper className="w-4 h-4" />
            Live
          </Badge>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading news...</p>}
        {error && <p className="text-sm text-red-500">Failed to load news.</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {data?.articles?.map((article: any) => {
            const title = article.headline?.toLowerCase() || "";
            const isPositive = title.includes("beat") || title.includes("up") || title.includes("surge") || title.includes("gain");
            const isNegative = title.includes("down") || title.includes("miss") || title.includes("cut") || title.includes("drop");
            return (
              <Card key={article.url} className="bg-card/50 border-border h-full">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : isNegative ? (
                      <Flame className="w-5 h-5 text-red-500" />
                    ) : (
                      <Newspaper className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg leading-tight line-clamp-2">{article.headline}</CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        isPositive ? "text-green-500 border-green-500/50" : isNegative ? "text-red-500 border-red-500/50" : ""
                      }
                    >
                      {isPositive ? "Positive" : isNegative ? "Negative" : "Neutral"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {article.summary || "No summary provided."}
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {article.source} • {article.datetime ? new Date(article.datetime * 1000).toLocaleString() : "recent"}
                  </div>
                  {article.url && (
                    <div className="mt-2 text-xs">
                      <a className="text-primary hover:underline" href={article.url} target="_blank" rel="noreferrer">
                        Read more
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
