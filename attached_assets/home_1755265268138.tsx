
import { Dashboard } from "@/components/Dashboard";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-purple-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-64 md:flex-shrink-0 lg:w-72">
        <div className="fixed h-full w-64 lg:w-72 z-30">
          <Sidebar />
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 lg:ml-72 overflow-x-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-50/50 to-blue-50/50 dark:from-transparent dark:via-purple-900/10 dark:to-blue-900/10 pointer-events-none"></div>
        <div className="relative z-10">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}
