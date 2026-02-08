import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

export function ProfileSetup() {
  const createProfile = useMutation(api.profiles.create);
  const { signOut } = useAuthActions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createProfile({ name, email });
    } catch (err) {
      setError("Could not create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Complete Your Profile</h1>
          </div>

          <p className="text-[#666] mb-6">
            Tell us a bit about yourself to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
                placeholder="John Doe"
                required
              />
            </div>

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
              {loading ? "Creating..." : "Continue"}
            </button>
          </form>

          <button
            onClick={() => signOut()}
            className="mt-4 w-full py-3 text-[#666] text-sm hover:text-[#1A1A1A] transition-colors"
          >
            Sign out and use different account
          </button>
        </div>
      </div>
    </div>
  );
}
