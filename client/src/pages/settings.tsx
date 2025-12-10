import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, ShieldCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem("finnhub_api_key");
    if (storedKey) setApiKey(storedKey);
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
    toast({
      title: "Settings Saved",
      description: "API Key has been updated securely.",
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
