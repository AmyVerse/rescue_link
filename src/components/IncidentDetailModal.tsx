import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Share2,
  Truck,
  Users,
  X,
} from "lucide-react";
import type { Incident } from "../types/incident";

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onNavigate: (incident: Incident) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

const getStatusTimeline = (incident: Incident) => [
  {
    id: 1,
    status: "Reported",
    description: "Incident reported by a community member",
    time: incident.timestamp,
    icon: AlertCircle,
    completed: true,
  },
  {
    id: 2,
    status: "Verified",
    description: "Verified by 3 nearby users",
    time: new Date(incident.timestamp.getTime() + 5 * 60000),
    icon: CheckCircle2,
    completed: true,
  },
  {
    id: 3,
    status: "Response Dispatched",
    description: "Emergency services notified and en route",
    time: new Date(incident.timestamp.getTime() + 12 * 60000),
    icon: Truck,
    completed: incident.severity === "critical" || incident.severity === "high",
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

const severityColors = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onNavigate,
  userLocation,
}) => {
  if (!incident) return null;

  const timeline = getStatusTimeline(incident);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return "Today";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDistance = () => {
    if (!userLocation) return null;
    const R = 6371;
    const dLat = ((incident.latitude - userLocation.latitude) * Math.PI) / 180;
    const dLon =
      ((incident.longitude - userLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.latitude * Math.PI) / 180) *
        Math.cos((incident.latitude * Math.PI) / 180) *
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
                    className={`px-2 py-0.5 rounded-xl text-xs font-medium border ${
                      severityColors[incident.severity]
                    }`}
                  >
                    {incident.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(incident.timestamp)} at{" "}
                    {formatTime(incident.timestamp)}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  {incident.title}
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
                  {incident.latitude.toFixed(4)},{" "}
                  {incident.longitude.toFixed(4)}
                  {getDistance() && (
                    <span className="text-gray-400 ml-1">
                      • {getDistance()}
                    </span>
                  )}
                </span>
              </div>

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
