import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "users" | "posts">("overview");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
          Admin Panel
        </h1>
        <p className="text-[#666]">Manage your platform, agents, and users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#F5F5F5] p-1 rounded-xl overflow-x-auto">
        {["overview", "agents", "users", "posts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 min-w-[80px] px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${
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
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "agents" && <AgentsTab />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "posts" && <PostsTab />}
    </div>
  );
}

function OverviewTab() {
  const stats = useQuery(api.agents.getStats);
  const analyticsStats = useQuery(api.analytics.getDashboardStats);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Total Agents</p>
          <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{stats?.totalAgents ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Active Agents</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600">{stats?.activeAgents ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Pending Review</p>
          <p className="text-2xl md:text-3xl font-bold text-yellow-600">{stats?.pendingAgents ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Active Subscriptions</p>
          <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{stats?.totalSubscriptions ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Total Revenue</p>
          <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">${stats?.totalRevenue ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
          <p className="text-xs md:text-sm text-[#999] mb-1">Total Usage</p>
          <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{stats?.totalUsage ?? 0}</p>
        </div>
      </div>

      {/* Activity Chart */}
      {analyticsStats && analyticsStats.dailyData.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Weekly Activity</h3>
          <div className="flex items-end gap-2 h-32">
            {analyticsStats.dailyData.map((day: { date: string; count: number }, i: number) => {
              const maxCount = Math.max(...analyticsStats.dailyData.map((d: { date: string; count: number }) => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-[#1A1A1A] rounded-t transition-all"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs text-[#999] hidden sm:block">
                    {new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AgentsTab() {
  const agents = useQuery(api.agents.list, {}) ?? [];
  const createAgent = useMutation(api.agents.create);
  const updateAgent = useMutation(api.agents.update);
  const deleteAgent = useMutation(api.agents.remove);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    capabilities: "",
    category: "Productivity",
    price: 0,
    priceType: "free" as "free" | "one-time" | "subscription",
  });

  const handleCreate = async () => {
    await createAgent({
      ...form,
      capabilities: form.capabilities.split(",").map((c) => c.trim()).filter(Boolean),
    });
    setForm({
      name: "",
      description: "",
      capabilities: "",
      category: "Productivity",
      price: 0,
      priceType: "free",
    });
    setShowCreate(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Manage Agents</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#1A1A1A] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors text-sm"
        >
          + Add Agent
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6">
          <h4 className="font-semibold text-[#1A1A1A] mb-4">Create New Agent</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
                placeholder="Agent Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
              >
                <option>Productivity</option>
                <option>Marketing</option>
                <option>Development</option>
                <option>Analytics</option>
                <option>Communication</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A] resize-none"
                rows={2}
                placeholder="What does this agent do?"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Capabilities (comma separated)</label>
              <input
                type="text"
                value={form.capabilities}
                onChange={(e) => setForm({ ...form, capabilities: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
                placeholder="Data Analysis, Report Generation, Automation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Price Type</label>
              <select
                value={form.priceType}
                onChange={(e) => setForm({ ...form, priceType: e.target.value as typeof form.priceType })}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
              >
                <option value="free">Free</option>
                <option value="one-time">One-time</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Price ($)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
                min={0}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-3 border-2 border-[#E5E5E5] text-[#666] font-semibold rounded-xl hover:border-[#1A1A1A] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 py-3 bg-[#1A1A1A] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors"
            >
              Create Agent
            </button>
          </div>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-8 text-center">
          <p className="text-[#666]">No agents yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent: Doc<"agents">) => (
            <div key={agent._id} className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A]">{agent.name}</h4>
                    <p className="text-sm text-[#666]">{agent.category} · ${agent.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    agent.status === "active" ? "bg-green-100 text-green-700" :
                    agent.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {agent.status}
                  </span>
                  {agent.status !== "active" && (
                    <button
                      onClick={() => updateAgent({ id: agent._id, status: "active" })}
                      className="px-3 py-1 text-xs font-semibold text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {agent.status === "active" && (
                    <button
                      onClick={() => updateAgent({ id: agent._id, status: "inactive" })}
                      className="px-3 py-1 text-xs font-semibold text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    >
                      Deactivate
                    </button>
                  )}
                  <button
                    onClick={() => deleteAgent({ id: agent._id })}
                    className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const profiles = useQuery(api.profiles.listAll) ?? [];
  const setRole = useMutation(api.profiles.setRole);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1A1A1A]">Manage Users</h3>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-8 text-center">
          <p className="text-[#666]">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E5E5]">
                  <th className="text-left p-4 text-sm font-semibold text-[#1A1A1A]">User</th>
                  <th className="text-left p-4 text-sm font-semibold text-[#1A1A1A]">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-[#1A1A1A]">Role</th>
                  <th className="text-left p-4 text-sm font-semibold text-[#1A1A1A]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile: Doc<"profiles">) => (
                  <tr key={profile._id} className="border-b border-[#E5E5E5] last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#E5E5E5] rounded-full flex items-center justify-center text-sm font-semibold text-[#666]">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#1A1A1A]">{profile.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#666]">{profile.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        profile.role === "admin" ? "bg-purple-100 text-purple-700" :
                        profile.role === "agent" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={profile.role}
                        onChange={(e) => setRole({ profileId: profile._id, role: e.target.value as "admin" | "agent" | "user" })}
                        className="px-2 py-1 border border-[#E5E5E5] rounded text-sm focus:outline-none focus:border-[#1A1A1A]"
                      >
                        <option value="user">User</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PostsTab() {
  const posts = useQuery(api.posts.list, {}) ?? [];
  const agents = useQuery(api.agents.list, {}) ?? [];
  const createPost = useMutation(api.posts.create);
  const updatePost = useMutation(api.posts.update);
  const deletePost = useMutation(api.posts.remove);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    agentId: "" as Id<"agents"> | "",
    title: "",
    content: "",
    type: "update" as "update" | "announcement" | "changelog",
    published: true,
  });

  const handleCreate = async () => {
    if (!form.agentId) return;
    await createPost({
      agentId: form.agentId as Id<"agents">,
      title: form.title,
      content: form.content,
      type: form.type,
      published: form.published,
    });
    setForm({
      agentId: "",
      title: "",
      content: "",
      type: "update",
      published: true,
    });
    setShowCreate(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Manage Posts</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#1A1A1A] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors text-sm"
        >
          + New Post
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6">
          <h4 className="font-semibold text-[#1A1A1A] mb-4">Create New Post</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Agent</label>
                <select
                  value={form.agentId}
                  onChange={(e) => setForm({ ...form, agentId: e.target.value as Id<"agents"> })}
                  className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
                >
                  <option value="">Select Agent</option>
                  {agents.map((a: Doc<"agents">) => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                  className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
                >
                  <option value="update">Update</option>
                  <option value="announcement">Announcement</option>
                  <option value="changelog">Changelog</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A]"
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl focus:border-[#1A1A1A] focus:outline-none transition-colors text-[#1A1A1A] resize-none"
                rows={4}
                placeholder="Write your post content..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-sm text-[#666]">Publish immediately</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-3 border-2 border-[#E5E5E5] text-[#666] font-semibold rounded-xl hover:border-[#1A1A1A] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!form.agentId || !form.title}
              className="flex-1 py-3 bg-[#1A1A1A] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              Create Post
            </button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-8 text-center">
          <p className="text-[#666]">No posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post: Doc<"posts">) => {
            const agent = agents.find((a: Doc<"agents">) => a._id === post.agentId);
            return (
              <div key={post._id} className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        post.type === "announcement" ? "bg-blue-100 text-blue-700" :
                        post.type === "changelog" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {post.type}
                      </span>
                      <span className="text-xs text-[#999]">{agent?.name || "Unknown Agent"}</span>
                      {!post.published && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Draft</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-[#1A1A1A] mb-1">{post.title}</h4>
                    <p className="text-sm text-[#666] line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updatePost({ id: post._id, published: !post.published })}
                      className="px-3 py-1 text-xs font-semibold text-[#666] hover:bg-[#F5F5F5] rounded-lg transition-colors"
                    >
                      {post.published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => deletePost({ id: post._id })}
                      className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
