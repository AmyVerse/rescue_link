import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Navigation,
  XCircle,
} from "lucide-react";
import type { Incident } from "../services/api";
import type { SeverityLevel } from "../types/incident";
import { getSeverityFromIncident } from "../types/incident";
import { calculateDistance, formatDistance } from "../utils/distance";

interface IncidentCardProps {
  incident: Incident;
  isSelected: boolean;
  onClick: () => void;
  userLat?: number;
  userLon?: number;
}

const severityStyles: Record<
  SeverityLevel,
  { border: string; selectedBg: string; badgeBg: string; badgeText: string }
> = {
  critical: {
    border: "border-l-red-600",
    selectedBg: "bg-red-50",
    badgeBg: "bg-red-100",
    badgeText: "text-red-600",
  },
  high: {
    border: "border-l-orange-500",
    selectedBg: "bg-orange-50",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-600",
  },
  medium: {
    border: "border-l-amber-500",
    selectedBg: "bg-amber-50",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-600",
  },
  low: {
    border: "border-l-green-500",
    selectedBg: "bg-green-50",
    badgeBg: "bg-green-100",
    badgeText: "text-green-600",
  },
};

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  isSelected,
  onClick,
  userLat,
  userLon,
}) => {
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const distance =
    userLat && userLon
      ? calculateDistance(userLat, userLon, incident.lat, incident.lng)
      : null;

  const severity = getSeverityFromIncident(incident);
  const styles = severityStyles[severity];

  return (
    <motion.div
      className={`bg-white rounded-xl p-4 mb-3 border-l-4 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg ${
        styles.border
      } ${isSelected ? `${styles.selectedBg} shadow-xl` : ""}`}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-2.5">
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${styles.badgeBg} ${styles.badgeText}`}
        >
          <AlertTriangle size={16} />
          <span>{severity.toUpperCase()}</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          #{incident.id.slice(0, 6)}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-800 my-2">
        {incident.type}
      </h3>
      <p className="text-sm text-gray-500 my-2 mb-3 leading-relaxed">
        {incident.description}
      </p>

      <div className="flex gap-3 my-3 py-2 border-t border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={14} className="text-gray-400" />
          <span>{formatTime(incident.createdAt)}</span>
        </div>
        {incident.status === "verified" && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle size={12} /> Verified
          </span>
        )}
        {incident.status === "unverified" && (
          <span className="text-xs text-yellow-600 font-medium">
            ⏳ Unverified
          </span>
        )}
        {incident.status === "false" && (
          <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
            <XCircle size={12} /> False Report
          </span>
        )}
        {incident.confirmations > 0 && (
          <span className="text-xs text-blue-600 font-medium">
            {incident.confirmations} confirmation
            {incident.confirmations > 1 ? "s" : ""}
          </span>
        )}
        {distance !== null && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Navigation size={14} className="text-gray-400" />
            <span>{formatDistance(distance)} away</span>
          </div>
        )}
      </div>

      <button
        className={`w-full py-2 mt-2.5 border rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
          isSelected
            ? "bg-sky-600 text-white border-sky-600 hover:bg-sky-700"
            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
        }`}
      >
        View Details
      </button>
    </motion.div>
  );
};
