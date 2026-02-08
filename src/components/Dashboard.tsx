import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface DashboardProps {
  profile: Doc<"profiles">;
}

export function Dashboard({ profile }: DashboardProps) {
  const subscriptions = useQuery(api.subscriptions.listUserSubscriptions) ?? [];
  const transactions = useQuery(api.transactions.listUserTransactions) ?? [];
  const updateProfile = useMutation(api.profiles.update);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "transactions" | "profile">("subscriptions");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    bio: profile.bio || "",
  });

  const handleProfileUpdate = async () => {
    await updateProfile(profileForm);
    setEditingProfile(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
          Dashboard
        </h1>
        <p className="text-[#666]">Manage your subscriptions and account</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Active Subscriptions</p>
          <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
            {subscriptions.filter((s: { status: string }) => s.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Total Spent</p>
          <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
            ${transactions.filter((t: Doc<"transactions">) => t.status === "completed").reduce((sum: number, t: Doc<"transactions">) => sum + t.amount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Account Type</p>
          <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A] capitalize">{profile.role}</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Member Since</p>
          <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
            {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#F5F5F5] p-1 rounded-xl overflow-x-auto">
        {["subscriptions", "transactions", "profile"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 min-w-[100px] px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${
              activeTab === tab
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : "text-[#666] hover:text-[#1A1A1A]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "subscriptions" && (
        <SubscriptionsTab subscriptions={subscriptions} />
      )}
      {activeTab === "transactions" && (
        <TransactionsTab transactions={transactions} />
      )}
      {activeTab === "profile" && (
        <ProfileTab
          profile={profile}
          editing={editingProfile}
          setEditing={setEditingProfile}
          form={profileForm}
          setForm={setProfileForm}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}

function SubscriptionsTab({ subscriptions }: { subscriptions: Array<Doc<"subscriptions"> & { agent: Doc<"agents"> | null }> }) {
  const cancelSubscription = useMutation(api.subscriptions.cancel);

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-8 text-center">
        <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No subscriptions yet</h3>
        <p className="text-[#666]">Browse the marketplace to find agents</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((sub) => (
        <div key={sub._id} className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A1A]">{sub.agent?.name || "Unknown Agent"}</h3>
                <p className="text-sm text-[#666]">
                  Started {new Date(sub.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                sub.status === "active" ? "bg-green-100 text-green-700" :
                sub.status === "cancelled" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {sub.status}
              </span>
              {sub.status === "active" && (
                <button
                  onClick={() => cancelSubscription({ id: sub._id })}
                  className="text-sm text-[#999] hover:text-red-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TransactionsTab({ transactions }: { transactions: Doc<"transactions">[] }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-8 text-center">
        <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No transactions yet</h3>
        <p className="text-[#666]">Your payment history will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5]">
              <th className="text-left p-4 text-sm font-semibold text-[#1A1A1A]">Date</th>
              <th className="text-left p-4 text-sm font-semibold text-[#1A1A1A]">Description</th>
              <th className="text-left p-4 text-sm font-semibold text-[#1A1A1A]">Amount</th>
              <th className="text-left p-4 text-sm font-semibold text-[#1A1A1A]">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-b border-[#E5E5E5] last:border-0">
                <td className="p-4 text-sm text-[#666] whitespace-nowrap">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm text-[#1A1A1A]">{t.description}</td>
                <td className="p-4 text-sm font-semibold text-[#1A1A1A] whitespace-nowrap">
                  ${t.amount} {t.currency}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    t.status === "completed" ? "bg-green-100 text-green-700" :
                    t.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    t.status === "failed" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProfileTab({
  profile,
  editing,
  setEditing,
  form,
  setForm,
  onSave,
}: {
  profile: Doc<"profiles">;
  editing: boolean;
  setEditing: (v: boolean) => void;
  form: { name: string; bio: string };
  setForm: (v: { name: string; bio: string }) => void;
  onSave: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Profile Settings</h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-[#666] hover:text-[#1A1A1A] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-[#E5E5E5] rounded-full flex items-center justify-center text-2xl font-bold text-[#666]">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          {editing ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-xl font-bold text-[#1A1A1A] bg-transparent border-b-2 border-[#E5E5E5] focus:border-[#1A1A1A] outline-none"
            />
          ) : (
            <p className="text-xl font-bold text-[#1A1A1A]">{profile.name}</p>
          )}
          <p className="text-sm text-[#999]">{profile.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Bio</label>
          {editing ? (
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A] resize-none"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-[#666]">{profile.bio || "No bio yet"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Role</label>
          <p className="text-[#666] capitalize">{profile.role}</p>
        </div>
      </div>

      {editing && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setForm({ name: profile.name, bio: profile.bio || "" });
              setEditing(false);
            }}
            className="flex-1 py-3 border-2 border-[#E5E5E5] text-[#666] font-semibold rounded-xl hover:border-[#1A1A1A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-3 bg-[#1A1A1A] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
