import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface AgentMarketplaceProps {
  profile: Doc<"profiles">;
}

export function AgentMarketplace({ profile }: AgentMarketplaceProps) {
  const agents = useQuery(api.agents.listPublic) ?? [];
  const categories = useQuery(api.agents.getCategories) ?? [];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Doc<"agents"> | null>(null);

  const filteredAgents = selectedCategory
    ? agents.filter((a: Doc<"agents">) => a.category === selectedCategory)
    : agents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
          Agent Marketplace
        </h1>
        <p className="text-[#666]">
          Discover and deploy AI agents to supercharge your workflow
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? "bg-[#1A1A1A] text-white"
                : "bg-[#F5F5F5] text-[#666] hover:bg-[#E5E5E5]"
            }`}
          >
            All
          </button>
          {categories.map((category: string) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#F5F5F5] text-[#666] hover:bg-[#E5E5E5]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Agent Grid */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No agents available</h3>
          <p className="text-[#666]">Check back soon for new AI agents</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent: Doc<"agents">) => (
            <AgentCard
              key={agent._id}
              agent={agent}
              onSelect={() => setSelectedAgent(agent)}
            />
          ))}
        </div>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          profile={profile}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

function AgentCard({
  agent,
  onSelect,
}: {
  agent: Doc<"agents">;
  onSelect: () => void;
}) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Productivity": "bg-blue-100 text-blue-700",
      "Marketing": "bg-pink-100 text-pink-700",
      "Development": "bg-green-100 text-green-700",
      "Analytics": "bg-purple-100 text-purple-700",
      "Communication": "bg-yellow-100 text-yellow-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E5E5E5] p-6 hover:border-[#1A1A1A] transition-colors group cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(agent.category)}`}>
          {agent.category}
        </span>
      </div>

      <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#333]">
        {agent.name}
      </h3>
      <p className="text-[#666] text-sm mb-4 line-clamp-2">
        {agent.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {agent.capabilities.slice(0, 3).map((cap: string, i: number) => (
          <span key={i} className="px-2 py-1 bg-[#F5F5F5] rounded-md text-xs text-[#666]">
            {cap}
          </span>
        ))}
        {agent.capabilities.length > 3 && (
          <span className="px-2 py-1 bg-[#F5F5F5] rounded-md text-xs text-[#666]">
            +{agent.capabilities.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#1A1A1A]">
            {agent.price === 0 ? "Free" : `$${agent.price}`}
          </span>
          {agent.priceType === "subscription" && agent.price > 0 && (
            <span className="text-xs text-[#999]">/month</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-[#999]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {agent.usageCount}
        </div>
      </div>
    </div>
  );
}

function AgentDetailModal({
  agent,
  profile,
  onClose,
}: {
  agent: Doc<"agents">;
  profile: Doc<"profiles">;
  onClose: () => void;
}) {
  const subscription = useQuery(api.subscriptions.checkSubscription, { agentId: agent._id });
  const subscribe = useMutation(api.subscriptions.create);
  const incrementUsage = useMutation(api.agents.incrementUsage);
  const trackAnalytics = useMutation(api.analytics.track);
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);

  const handleSubscribe = async () => {
    if (agent.price > 0 && !paymentStep) {
      setPaymentStep(true);
      return;
    }

    setLoading(true);
    try {
      await subscribe({ agentId: agent._id });
      await trackAnalytics({ agentId: agent._id, action: "subscribe" });
      setPaymentStep(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async () => {
    await incrementUsage({ id: agent._id });
    await trackAnalytics({ agentId: agent._id, action: "use" });
    alert("Agent activated! (Demo mode - in production this would trigger the agent)");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">{agent.name}</h2>
                <span className="text-sm text-[#999]">{agent.category}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-[#666] mb-6">{agent.description}</p>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-[#F5F5F5] rounded-lg text-sm text-[#666]">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#F5F5F5] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#1A1A1A]">{agent.usageCount}</p>
              <p className="text-xs text-[#999]">Uses</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#1A1A1A]">
                {agent.price === 0 ? "Free" : `$${agent.price}`}
              </p>
              <p className="text-xs text-[#999]">{agent.priceType}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#1A1A1A]">{agent.rating || "N/A"}</p>
              <p className="text-xs text-[#999]">Rating</p>
            </div>
          </div>

          {paymentStep ? (
            <div className="border-2 border-[#E5E5E5] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Complete Payment</h3>
              <p className="text-sm text-[#666] mb-4">
                Payment gateway integration ready. In production, this would connect to Stripe.
              </p>
              <div className="bg-[#F5F5F5] rounded-lg p-4 mb-4">
                <p className="text-sm text-[#999]">Amount</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">${agent.price}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentStep(false)}
                  className="flex-1 py-3 border-2 border-[#E5E5E5] text-[#666] font-semibold rounded-xl hover:border-[#1A1A1A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#1A1A1A] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          ) : subscription ? (
            <button
              onClick={handleUse}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              Use Agent
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3 bg-[#1A1A1A] text-white font-semibold rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : agent.price === 0 ? "Get Free Access" : `Subscribe - $${agent.price}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
