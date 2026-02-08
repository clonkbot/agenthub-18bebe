import { useAuthActions } from "@convex-dev/auth/react";
import { Doc } from "../../convex/_generated/dataModel";
import { useState } from "react";

type View = "marketplace" | "dashboard" | "admin";

interface NavigationProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  profile: Doc<"profiles">;
}

export function Navigation({ currentView, setCurrentView, profile }: NavigationProps) {
  const { signOut } = useAuthActions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { key: View; label: string; adminOnly?: boolean }[] = [
    { key: "marketplace", label: "Marketplace" },
    { key: "dashboard", label: "Dashboard" },
    { key: "admin", label: "Admin", adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || profile.role === "admin"
  );

  return (
    <header className="bg-white border-b-2 border-[#E5E5E5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-[#1A1A1A] tracking-tight">AgentHub</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {filteredNavItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  currentView === item.key
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#666] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E5E5E5] rounded-full flex items-center justify-center text-sm font-semibold text-[#666]">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-[#1A1A1A]">{profile.name}</p>
                <p className="text-xs text-[#999] capitalize">{profile.role}</p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="hidden sm:block px-3 py-2 text-sm font-medium text-[#666] hover:text-[#1A1A1A] transition-colors"
            >
              Sign Out
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
            >
              <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5E5E5]">
            <div className="flex flex-col gap-1">
              {filteredNavItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setCurrentView(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg font-medium text-sm text-left transition-colors ${
                    currentView === item.key
                      ? "bg-[#1A1A1A] text-white"
                      : "text-[#666] hover:bg-[#F5F5F5]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-2 pt-2 border-t border-[#E5E5E5]">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 bg-[#E5E5E5] rounded-full flex items-center justify-center text-sm font-semibold text-[#666]">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">{profile.name}</p>
                    <p className="text-xs text-[#999] capitalize">{profile.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-3 text-sm font-medium text-[#666] hover:text-[#1A1A1A] text-left transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
