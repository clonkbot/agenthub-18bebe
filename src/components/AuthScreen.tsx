import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", flow);
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not sign in as guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Branding */}
        <div className="lg:w-1/2 bg-[#1A1A1A] p-8 lg:p-16 flex flex-col justify-center min-h-[40vh] lg:min-h-screen">
          <div className="max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">AgentHub</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Deploy AI Agents.<br />
              <span className="text-[#888]">Scale Your Business.</span>
            </h1>

            <p className="text-[#888] text-base lg:text-lg leading-relaxed mb-8">
              The marketplace for AI agents. Discover, deploy, and manage intelligent automation tools that transform how you work.
            </p>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-[#888]">Real-time sync</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-[#888]">Instant deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-[#888]">Pay per use</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                {flow === "signIn" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-[#666]">
                {flow === "signIn"
                  ? "Sign in to access your agents and dashboard"
                  : "Get started with AgentHub today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1A1A1A] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : flow === "signIn" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-[#E5E5E5]" />
              <span className="text-sm text-[#999]">or</span>
              <div className="flex-1 h-px bg-[#E5E5E5]" />
            </div>

            <button
              onClick={handleAnonymous}
              disabled={loading}
              className="mt-6 w-full py-3 bg-white border-2 border-[#E5E5E5] text-[#666] font-semibold rounded-xl hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors disabled:opacity-50"
            >
              Continue as Guest
            </button>

            <p className="mt-6 text-center text-sm text-[#666]">
              {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="text-[#1A1A1A] font-semibold hover:underline"
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center border-t border-[#E5E5E5]">
        <p className="text-xs text-[#999] tracking-wide">
          Requested by <a href="https://twitter.com/T1000_V2" target="_blank" rel="noopener noreferrer" className="hover:text-[#666] transition-colors">@T1000_V2</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-[#666] transition-colors">@clonkbot</a>
        </p>
      </footer>
    </div>
  );
}
