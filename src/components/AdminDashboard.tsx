import { AlertTriangle, Clock, RefreshCw, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, type Incident } from "../services/api";
import { getSeverityFromIncident } from "../types/incident";

interface AdminDashboardProps {
  onIncidentClick?: (incident: Incident) => void;
}

const statusColors = {
  unverified: "bg-yellow-100 text-yellow-700",
  verified: "bg-green-100 text-green-700",
  false: "bg-red-100 text-red-700",
  resolved: "bg-gray-100 text-gray-700",
};

const severityColors = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onIncidentClick,
}) => {
  const { isAdmin } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [lastEvalResult, setLastEvalResult] = useState<{
    checked: number;
    updated: number;
  } | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminIncidents();
      setIncidents(data);
    } catch (error) {
      console.error("Failed to fetch admin incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateFalse = async () => {
    setEvaluating(true);
    try {
      const result = await api.evaluateFalseIncidents();
      setLastEvalResult(result);
      // Refresh incidents after evaluation
      await fetchIncidents();
    } catch (error) {
      console.error("Failed to evaluate false incidents:", error);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchIncidents();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
        <Shield size={48} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          Admin Access Required
        </h2>
        <p className="text-gray-500 text-center">
          You need to be logged in as an admin to access this dashboard.
        </p>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const stats = {
    total: incidents.length,
    unverified: incidents.filter((i) => i.status === "unverified").length,
    verified: incidents.filter((i) => i.status === "verified").length,
    false: incidents.filter((i) => i.status === "false").length,
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pt-14 md:pt-0 pb-24 md:pb-28 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto flex flex-col">
        {/* Header */}
        <div className="mx-4 md:mx-6 mt-4 p-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-amber-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-gray-500">
                  All incidents sorted by priority
                </p>
              </div>
            </div>
            <button
              onClick={fetchIncidents}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={20}
                className={`text-gray-600 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.unverified}
              </p>
              <p className="text-xs text-yellow-600">Unverified</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.verified}
              </p>
              <p className="text-xs text-green-600">Verified</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-red-600">{stats.false}</p>
              <p className="text-xs text-red-600">False</p>
            </div>
          </div>
        </div>

        {/* Auto-evaluate false reports */}
        <div className="mx-4 md:mx-6 mt-4 p-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Auto-Evaluate False Reports
              </h3>
              <p className="text-xs text-gray-500">
                Mark unverified incidents with 0 confirmations as false after
                time limit
              </p>
            </div>
            <button
              onClick={handleEvaluateFalse}
              disabled={evaluating}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              {evaluating ? "Evaluating..." : "Run Evaluation"}
            </button>
          </div>
          {lastEvalResult && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
              Checked {lastEvalResult.checked} incidents, marked{" "}
              {lastEvalResult.updated} as false
            </div>
          )}
        </div>

        {/* Incidents List */}
        <div className="mx-4 md:mx-6 mt-4 space-y-3 mb-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading incidents...
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active incidents
            </div>
          ) : (
            incidents.map((incident) => {
              const severity = getSeverityFromIncident(incident);
              return (
                <div
                  key={incident.id}
                  onClick={() => onIncidentClick?.(incident)}
                  className={`bg-white rounded-xl p-4 border-l-4 ${severityColors[severity]} cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[incident.status]
                        }`}
                      >
                        {incident.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Priority: {incident.priorityScore}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      #{incident.id}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-800 capitalize mb-1">
                    {incident.type}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {incident.description || "No description"}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTime(incident.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      {incident.confirmations} confirmations
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Trust: {incident.trustScore}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
