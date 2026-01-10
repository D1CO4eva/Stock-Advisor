import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, Send, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { askAi, type ChatSources } from "@/lib/ai";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSources[];
};

export default function AIInsights() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask me about stocks, sectors, or a ticker. I’ll pull live Finnhub data and cite sources.",
    },
  ]);
  const [input, setInput] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: (payload: { prompt: string; articleUrl?: string }) => askAi(payload.prompt, payload.articleUrl),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    },
    onError: (err: any) => {
      toast({
        title: "Chat failed",
        description: err?.message || "Unable to get a response.",
        variant: "destructive",
      });
    },
  });

  const sendMessage = () => {
    if (!input.trim()) return;
    const payload = { prompt: input.trim(), articleUrl: articleUrl.trim() || undefined };
    setMessages((prev) => [...prev, { role: "user", content: input.trim() }]);
    setInput("");
    chatMutation.mutate(payload);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">AI Insights</h1>
            <p className="text-muted-foreground">Chat about markets and tickers with live data + sources.</p>
          </div>
          <Badge className="gap-2">
            <Sparkles className="w-4 h-4" />
            Live
          </Badge>
        </div>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[420px] pr-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg border border-border/60 px-3 py-2 ${
                      msg.role === "user" ? "bg-primary/10" : "bg-background/60"
                    }`}
                  >
                    <div className="text-xs font-semibold text-muted-foreground mb-1">
                      {msg.role === "user" ? "You" : "Assistant"}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs font-semibold text-muted-foreground">Sources</div>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((s, i) => (
                            <a
                              key={`${s.url || s.symbol}-${i}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              href={s.url || "#"}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <LinkIcon className="w-3 h-3" />
                              {s.symbol || s.source || s.type}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="text-xs text-muted-foreground">Thinking...</div>
                )}
              </div>
            </ScrollArea>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3 flex gap-2">
                <Input
                  placeholder="Ask about a ticker, sector, or market event..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button onClick={sendMessage} disabled={chatMutation.isPending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <Input
                placeholder="Optional: article URL to analyze"
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
