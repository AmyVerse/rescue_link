import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  CreateIncidentPayload,
  CreateIncidentResponse,
  Incident,
} from "../services/api";
import { api, socketService } from "../services/api";

interface IncidentContextType {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  userLocation: { lat: number; lng: number } | null;
  createIncident: (
    payload: CreateIncidentPayload
  ) => Promise<CreateIncidentResponse>;
  confirmIncident: (id: string) => Promise<void>;
  markFalse: (id: string) => Promise<void>;
  refreshIncidents: () => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | null>(null);

export const useIncidents = () => {
  const ctx = useContext(IncidentContext);
  if (!ctx)
    throw new Error("useIncidents must be used within IncidentProvider");
  return ctx;
};

export const IncidentProvider = ({ children }: { children: ReactNode }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const fetchIncidents = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const data = await api.getNearbyIncidents(lat, lng);
      setIncidents(data);
      setError(null);
    } catch (e) {
      setError("Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        fetchIncidents(loc.lat, loc.lng);

        // Setup socket
        socketService.connect();
        socketService.joinArea(loc.lat, loc.lng);

        socketService.onNewIncident((incident) => {
          setIncidents((prev) => [incident, ...prev]);
        });

        socketService.onIncidentUpdate((updated) => {
          setIncidents((prev) =>
            prev.map((inc) => (inc.id === updated.id ? updated : inc))
          );
        });
      },
      () => setError("Location access denied")
    );

    return () => {
      socketService.offNewIncident();
      socketService.offIncidentUpdate();
      socketService.disconnect();
    };
  }, []);

  const createIncident = async (payload: CreateIncidentPayload) => {
    const incident = await api.createIncident(payload);
    return incident;
  };

  const confirmIncident = async (id: string) => {
    await api.confirmIncident(id);
  };

  const markFalse = async (id: string) => {
    await api.markIncidentFalse(id);
  };

  const refreshIncidents = async () => {
    if (userLocation) {
      await fetchIncidents(userLocation.lat, userLocation.lng);
    }
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        loading,
        error,
        userLocation,
        createIncident,
        confirmIncident,
        markFalse,
        refreshIncidents,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};
