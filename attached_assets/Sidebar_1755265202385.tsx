import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Activity,
  Eye,
  Users,
  Brain,
  Lock,
  Database,
  Settings,
  ShieldCheck,
  User,
  Shield,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "Anomaly Detection", href: "/anomalies", icon: Eye },
  { name: "Edge Clients", href: "/clients", icon: Users },
  { name: "FL Training", href: "/training", icon: Brain },
  { name: "Privacy Controls", href: "/privacy", icon: Lock },
  { name: "Model Registry", href: "/models", icon: Database },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-full h-full md:w-64 md:h-screen bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-slate-700 flex flex-col shadow-xl">
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center space-x-2 sm:space-x-3 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 animate-float">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm sm:text-base md:text-lg gradient-text truncate">IntelliGuard</h2>
            <p className="text-xs text-muted-foreground truncate">AI-Powered Security</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 sm:p-3 md:p-4 sidebar-nav overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-xl transition-all duration-300 group cursor-pointer relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 text-white shadow-xl shadow-purple-500/25 scale-[1.02]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-purple-50 dark:hover:from-slate-700/50 dark:hover:to-purple-900/20 hover:text-slate-800 dark:hover:text-white hover:shadow-lg hover:scale-[1.01]"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
                  )}
                  <div className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300",
                    isActive
                      ? "bg-white/20 backdrop-blur-sm"
                      : "bg-gray-100 dark:bg-slate-700 group-hover:bg-gray-200 dark:group-hover:bg-slate-600"
                  )}>
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm sm:text-base md:text-base truncate font-semibold block leading-tight">{item.name}</span>
                    {isActive && (
                      <div className="text-xs text-white/80 font-normal">Active</div>
                    )}
                  </div>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full animate-pulse flex-shrink-0 shadow-lg"></div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <div className="status-indicator status-online blinking"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">Security Operations</p>
          </div>
        </div>
      </div>
    </aside>
  );
}