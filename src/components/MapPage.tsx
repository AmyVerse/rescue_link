import { lazy, Suspense, useEffect } from "react";
import type { Incident } from "../types/incident";

const MapComponent = lazy(() =>
  import("./Map").then((m) => ({ default: m.MapComponent }))
);

interface MapPageProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onIncidentSelect: (incident: Incident | null) => void;
  incidentIdFromUrl: string | null;
  userLocation?: { latitude: number; longitude: number } | null;
}

export const MapPage: React.FC<MapPageProps> = ({
  incidents,
  selectedIncident,
  onIncidentSelect,
  incidentIdFromUrl,
  userLocation,
}) => {
  useEffect(() => {
    if (incidentIdFromUrl) {
      const incident = incidents.find((i) => i.id === incidentIdFromUrl);
      if (incident && selectedIncident?.id !== incidentIdFromUrl) {
        onIncidentSelect(incident);
      }
    }
  }, [incidentIdFromUrl, incidents, selectedIncident, onIncidentSelect]);

  return (
    <div className="w-full h-full relative">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-xl animate-spin" />
              <span className="text-gray-500 text-sm">Loading map...</span>
            </div>
          </div>
        }
      >
        <MapComponent
          incidents={incidents}
          selectedIncident={selectedIncident}
          onIncidentSelect={onIncidentSelect}
          userLocation={userLocation}
        />
      </Suspense>

      {selectedIncident && (
        <div className="absolute bottom-20 md:bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-10">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span
                className={`inline-block px-2 py-0.5 rounded-xl text-xs font-medium mb-1 ${
                  selectedIncident.severity === "critical"
                    ? "bg-red-100 text-red-700"
                    : selectedIncident.severity === "high"
                    ? "bg-orange-100 text-orange-700"
                    : selectedIncident.severity === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {selectedIncident.severity.toUpperCase()}
              </span>
              <h3 className="font-semibold text-gray-800">
                {selectedIncident.title}
              </h3>
            </div>
            <button
              onClick={() => onIncidentSelect(null)}
              className="p-1 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-400"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {selectedIncident.description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {selectedIncident.timestamp.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            <span className="flex items-center gap-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-sky-600"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              {selectedIncident.latitude.toFixed(3)},{" "}
              {selectedIncident.longitude.toFixed(3)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
