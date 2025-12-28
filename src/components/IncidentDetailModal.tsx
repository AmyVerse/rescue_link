import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Flag,
  MapPin,
  MessageCircle,
  Navigation,
  Share2,
  ThumbsUp,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, type Incident } from "../services/api";
import type { SeverityLevel } from "../types/incident";
import { getSeverityFromIncident } from "../types/incident";

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdate?: (incident: Incident) => void;
  onNavigate: (incident: Incident) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

const getStatusTimeline = (incident: Incident) => {
  const createdAt = incident.createdAt
    ? new Date(incident.createdAt)
    : new Date();
  const severity = getSeverityFromIncident(incident);
  const isVerified = incident.status === "verified";

  return [
    {
      id: 1,
      status: "Reported",
      description: `Incident reported by a community member (${
        incident.confirmations
      } confirmation${incident.confirmations !== 1 ? "s" : ""})`,
      time: createdAt,
      icon: AlertCircle,
      completed: true,
    },
    {
      id: 2,
      status: "Verified",
      description: isVerified
        ? "Verified by community confirmations"
        : incident.status === "false"
        ? "Marked as false report"
        : "Awaiting verification",
      time: isVerified ? new Date(createdAt.getTime() + 5 * 60000) : null,
      icon: CheckCircle2,
      completed: isVerified,
    },
    {
      id: 3,
      status: "Response Dispatched",
      description: "Emergency services notified and en route",
      time:
        isVerified && (severity === "critical" || severity === "high")
          ? new Date(createdAt.getTime() + 12 * 60000)
          : null,
      icon: Truck,
      completed: isVerified && (severity === "critical" || severity === "high"),
    },
    {
      id: 4,
      status: "On Scene",
      description: "Responders arrived at location",
      time: null,
      icon: Users,
      completed: false,
    },
  ];
};

const severityColors: Record<SeverityLevel, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onNavigate,
  onUpdate,
  userLocation,
}) => {
  const { isAdmin } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isMarkingFalse, setIsMarkingFalse] = useState(false);

  if (!incident) return null;

  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      const updated = await api.confirmIncident(incident.id);
      // Preserve lat/lng from current incident
      updated.lat = incident.lat;
      updated.lng = incident.lng;
      onUpdate?.(updated);
    } catch (error) {
      console.error("Failed to confirm incident:", error);
      alert("Failed to confirm incident. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleMarkFalse = async () => {
    if (isMarkingFalse) return;
    setIsMarkingFalse(true);
    try {
      await api.markIncidentFalse(incident.id);
      // Backend returns {status: "marked false"}, so we construct the updated incident locally
      const updated: Incident = {
        ...incident,
        status: "false",
      };
      onUpdate?.(updated);
    } catch (error) {
      console.error("Failed to mark incident as false:", error);
      alert("Failed to mark incident as false. Please try again.");
    } finally {
      setIsMarkingFalse(false);
    }
  };

  const timeline = getStatusTimeline(incident);
  const severity = getSeverityFromIncident(incident);

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Today";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return "Today";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDistance = () => {
    if (!userLocation) return null;
    const R = 6371;
    const dLat = ((incident.lat - userLocation.latitude) * Math.PI) / 180;
    const dLon = ((incident.lng - userLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.latitude * Math.PI) / 180) *
        Math.cos((incident.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    return dist < 1
      ? `${Math.round(dist * 1000)}m away`
      : `${dist.toFixed(1)}km away`;
  };

  return (
    <AnimatePresence>
      {incident && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-white rounded-t-3xl md:rounded-2xl md:w-full md:max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-start justify-between p-4 border-b border-gray-100">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded-xl text-xs font-medium border ${severityColors[severity]}`}
                  >
                    {severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(incident.createdAt)} at{" "}
                    {formatTime(
                      incident.createdAt ? new Date(incident.createdAt) : null
                    )}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  {incident.type}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors -mt-1"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-sky-600 shrink-0" />
                <span>
                  {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                  {getDistance() && (
                    <span className="text-gray-400 ml-1">
                      • {getDistance()}
                    </span>
                  )}
                </span>
              </div>

              {incident.status && incident.status !== "resolved" && (
                <div className="flex gap-2 flex-wrap">
                  {incident.status === "verified" && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      ✓ Verified
                    </span>
                  )}
                  {incident.status === "unverified" && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                      ⏳ Unverified
                    </span>
                  )}
                  {incident.status === "false" && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                      ✗ False Report
                    </span>
                  )}
                  {incident.confirmations > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      👥 {incident.confirmations} confirmation
                      {incident.confirmations > 1 ? "s" : ""}
                    </span>
                  )}
                  {incident.trustScore > 1 && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                      ⭐ Trust: {incident.trustScore}
                    </span>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {incident.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Status Timeline
                </h3>
                <div className="space-y-1">
                  {timeline.map((item, index) => {
                    const Icon = item.icon;
                    const isLast = index === timeline.length - 1;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              item.completed
                                ? "bg-sky-100 text-sky-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <Icon size={16} />
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 h-12 ${
                                item.completed ? "bg-sky-200" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 pb-4">
                          <p
                            className={`font-medium text-sm ${
                              item.completed ? "text-gray-800" : "text-gray-400"
                            }`}
                          >
                            {item.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.description}
                          </p>
                          {item.time && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatTime(item.time)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white space-y-2">
              <button
                onClick={() => onNavigate(incident)}
                className="w-full py-3 bg-linear-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Navigation size={18} />
                Navigate to Location
              </button>

              {/* Confirm / Mark False buttons - only show for admins on unverified incidents */}
              {isAdmin && incident.status === "unverified" && (
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex-1 py-2.5 bg-green-100 text-green-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp size={16} />
                    {isConfirming ? "Confirming..." : "Confirm"}
                  </button>
                  <button
                    onClick={handleMarkFalse}
                    disabled={isMarkingFalse}
                    className="flex-1 py-2.5 bg-red-100 text-red-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    <Flag size={16} />
                    {isMarkingFalse ? "Marking..." : "False Report"}
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                  <MessageCircle size={16} />
                  Comment
                </button>
                <button className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
