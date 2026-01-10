import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [kimiKey, setKimiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem("finnhub_api_key");
    if (storedKey) setApiKey(storedKey);
    const storedKimi = localStorage.getItem("kimi_api_key");
    if (storedKimi) setKimiKey(storedKimi);
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      localStorage.removeItem("finnhub_api_key");
      toast({
        title: "API Key Removed",
        description: "The application will now use mock data.",
      });
      return;
    }

    localStorage.setItem("finnhub_api_key", apiKey.trim());
    if (kimiKey.trim()) {
      localStorage.setItem("kimi_api_key", kimiKey.trim());
    } else {
      localStorage.removeItem("kimi_api_key");
    }
    toast({
      title: "Settings Saved",
      description: "Keys have been updated.",
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences and data sources.</p>
        </div>

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <CardTitle>Data Source Configuration</CardTitle>
            </div>
            <CardDescription>
              Connect to live market data using Finnhub API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Finnhub API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Finnhub API key (e.g., c12345...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Get a free API key at <a href="https://finnhub.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">finnhub.io</a>.
                Your key is stored locally in your browser and never sent to our servers.
              </p>
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-primary">Privacy First</h4>
                <p className="text-xs text-muted-foreground">
                  This application runs entirely in your browser. When you provide an API key, it is used directly from your client to fetch data from Finnhub.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border/50">
              <Label htmlFor="kimi-key">Kimi API Key</Label>
              <Input
                id="kimi-key"
                type="password"
                placeholder="Enter your Kimi API key"
                value={kimiKey}
                onChange={(e) => setKimiKey(e.target.value)}
                className="font-mono bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Used for AI chat fallback when the server key is unavailable. Stored locally in your browser.
              </p>
              <div className="rounded-lg bg-secondary/10 border border-secondary/30 p-3 flex gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>
                  If chat fails due to missing server config, this key lets the client call Kimi directly. Keep it private.
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="ml-auto">
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
