import { useConvexAuth } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { AgentMarketplace } from "./components/AgentMarketplace";
import { AdminPanel } from "./components/AdminPanel";
import { Navigation } from "./components/Navigation";
import { ProfileSetup } from "./components/ProfileSetup";

type View = "marketplace" | "dashboard" | "admin";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.get);
  const [currentView, setCurrentView] = useState<View>("marketplace");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#666] font-medium tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#666] font-medium tracking-wide">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profile === null) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        profile={profile}
      />

      <main className="flex-1">
        {currentView === "marketplace" && <AgentMarketplace profile={profile} />}
        {currentView === "dashboard" && <Dashboard profile={profile} />}
        {currentView === "admin" && profile.role === "admin" && <AdminPanel />}
      </main>

      <footer className="py-4 text-center border-t border-[#E5E5E5]">
        <p className="text-xs text-[#999] tracking-wide">
          Requested by <a href="https://twitter.com/T1000_V2" target="_blank" rel="noopener noreferrer" className="hover:text-[#666] transition-colors">@T1000_V2</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-[#666] transition-colors">@clonkbot</a>
        </p>
      </footer>
    </div>
  );
}
