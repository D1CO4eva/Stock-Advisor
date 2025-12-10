import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, TrendingUp, PieChart, Newspaper, Settings, Menu, X, BrainCircuit } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: TrendingUp, label: "Market Analysis", href: "/market" },
    { icon: PieChart, label: "Portfolio", href: "/portfolio" },
    { icon: BrainCircuit, label: "AI Insights", href: "/ai-insights" },
    { icon: Newspaper, label: "News & Sentiment", href: "/news" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <BrainCircuit className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-display font-bold tracking-tight">InvestAI</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group font-medium",
                  isActive
                    ? "bg-sidebar-primary/10 text-primary shadow-[0_0_10px_rgba(59,130,246,0.1)] border border-primary/20"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-xs text-muted-foreground mb-1">Portfolio Value</div>
          <div className="text-lg font-mono font-bold text-foreground">$27,703.25</div>
          <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            +2.4% Today
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar border-r border-sidebar-border">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
