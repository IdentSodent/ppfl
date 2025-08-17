import { Link, useLocation } from "wouter";
import { Shield, BarChart3, AlertTriangle, Cpu, Brain, ShieldQuestion, Settings, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    badge: null,
    indicator: true
  },
  {
    name: "Anomaly Timeline",
    href: "/timeline",
    icon: AlertTriangle,
    badge: "3",
    indicator: false
  },
  {
    name: "AI Analysis",
    href: "/analysis",
    icon: Eye,
    badge: "NEW",
    indicator: false
  },
  {
    name: "Edge Devices",
    href: "/devices",
    icon: Cpu,
    badge: "127",
    indicator: false
  },
  {
    name: "FL Training",
    href: "/training",
    icon: Brain,
    badge: null,
    indicator: false
  },
  {
    name: "Privacy & Security",
    href: "/privacy",
    icon: ShieldQuestion,
    badge: null,
    indicator: false
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
    indicator: false
  }
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 glass-morphism border-r border-slate-700/50 flex flex-col" data-testid="sidebar">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyber-green rounded-lg flex items-center justify-center">
            <Shield className="text-slate-900 text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">PPFL System</h1>
            <p className="text-xs text-slate-400">Privacy-Preserving FL</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2" data-testid="navigation">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/30"
              )}
              data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
              {item.indicator && (
                <div className="ml-auto w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
              )}
              {item.badge && (
                <div className={cn(
                  "ml-auto text-xs px-2 py-1 rounded-full",
                  item.badge === "3" 
                    ? "bg-cyber-red text-white" 
                    : "text-cyber-green font-mono"
                )}>
                  {item.badge}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* System Health */}
      <div className="p-4 border-t border-slate-700/50" data-testid="system-health">
        <div className="text-xs text-slate-400 mb-2">System Health</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">CPU</span>
            <span className="text-xs font-mono text-cyber-amber">12.3%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Memory</span>
            <span className="text-xs font-mono text-cyber-blue">4.2GB</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Network</span>
            <span className="text-xs font-mono text-cyber-green">stable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
