import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Clock,
  Eye,
  Filter,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  Share2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Incident } from "../types/incident";
import { calculateDistance } from "../utils/distance";

interface HomePageProps {
  incidents: Incident[];
  userLocation: { latitude: number; longitude: number } | null;
  onIncidentClick: (incident: Incident) => void;
  onNavigate?: (incident: Incident) => void;
}

const severityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const severityLabels = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const HomePage: React.FC<HomePageProps> = ({
  incidents,
  userLocation,
  onIncidentClick,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const filteredIncidents = useMemo(() => {
    let filtered = incidents.filter(
      (incident) =>
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (severityFilter !== "all") {
      filtered = filtered.filter((i) => i.severity === severityFilter);
    }

    if (userLocation) {
      filtered.sort((a, b) => {
        const distA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      });
    }

    return filtered;
  }, [incidents, searchTerm, severityFilter, userLocation]);

  const handleVote = (incidentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedIds.has(incidentId)) {
      setVotedIds((prev) => {
        const next = new Set(prev);
        next.delete(incidentId);
        return next;
      });
      setVotes((prev) => ({
        ...prev,
        [incidentId]: (prev[incidentId] || 0) - 1,
      }));
    } else {
      setVotedIds((prev) => new Set(prev).add(incidentId));
      setVotes((prev) => ({
        ...prev,
        [incidentId]: (prev[incidentId] || 0) + 1,
      }));
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getDistance = (incident: Incident) => {
    if (!userLocation) return null;
    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      incident.latitude,
      incident.longitude
    );
    return dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        <div className="hidden md:block p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl shadow-md px-4 py-2.5 border border-gray-200">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-none outline-none text-sm bg-transparent text-gray-800 placeholder:text-gray-400"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors ${
                showFilters || severityFilter !== "all"
                  ? "bg-sky-100 border-sky-200 text-sky-600"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter size={18} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3">
                  {["all", "critical", "high", "medium", "low"].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        severityFilter === sev
                          ? "bg-sky-100 text-sky-700 ring-2 ring-sky-300"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {sev === "all"
                        ? "All"
                        : severityLabels[sev as keyof typeof severityLabels]}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="md:hidden pt-16 px-3 pb-2">
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-md px-4 py-2.5 border border-gray-100">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-none outline-none text-sm bg-transparent text-gray-800 placeholder:text-gray-400"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-xl transition-colors ${
                showFilters ? "bg-sky-100 text-sky-600" : "text-gray-400"
              }`}
            >
              <Filter size={16} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-2">
                  {["all", "critical", "high", "medium", "low"].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                        severityFilter === sev
                          ? "bg-sky-100 text-sky-700"
                          : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      {sev === "all"
                        ? "All"
                        : severityLabels[sev as keyof typeof severityLabels]}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 py-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Nearby Incidents</h2>
          <span className="text-xs text-gray-500">
            {filteredIncidents.length} active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-24 md:pb-4 space-y-3">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onIncidentClick(incident)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-xl ${
                        severityColors[incident.severity]
                      }`}
                    />
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {incident.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {formatTimeAgo(incident.timestamp)}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-800 mb-1">
                  {incident.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {incident.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleVote(incident.id, e)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                        votedIds.has(incident.id)
                          ? "bg-sky-100 text-sky-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <ArrowUp size={14} />
                      <span className="text-xs font-medium">
                        {(votes[incident.id] || 0) +
                          Math.floor(Math.random() * 10 + 5)}
                      </span>
                    </button>

                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <MessageCircle size={14} />
                      <span className="text-xs font-medium">
                        {Math.floor(Math.random() * 8 + 1)}
                      </span>
                    </button>

                    {getDistance(incident) && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        {getDistance(incident)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator
                          .share?.({
                            title: incident.title,
                            text: incident.description,
                            url: `${window.location.origin}/map/${incident.id}`,
                          })
                          .catch(() => {});
                      }}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onIncidentClick(incident);
                      }}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.(incident);
                      }}
                      className="p-2 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Navigate"
                    >
                      <Navigation size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Search size={32} className="mb-2 text-gray-300" />
              <p className="text-sm">No incidents found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
