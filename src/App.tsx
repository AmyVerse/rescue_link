import { Home, Map, Shield, User } from "lucide-react";
import { Component, type ReactNode, useEffect, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { AccountPage } from "./components/AccountPage";
import { AdminDashboard } from "./components/AdminDashboard";
import Dock from "./components/Dock";
import { EmergencyModal } from "./components/EmergencyModal";
import { HomePage } from "./components/HomePage";
import { IncidentDetailModal } from "./components/IncidentDetailModal";
import { MapPage } from "./components/MapPage";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { MobileHeader } from "./components/MobileHeader";
import { NewIncidentForm } from "./components/NewIncidentForm";
import { useAuth } from "./context/AuthContext";
import { useGeolocation } from "./hooks/useGeolocation";
import type { CreateIncidentPayload, Incident } from "./services/api";
import { api, socketService } from "./services/api";
import { incidentCache } from "./utils/cache";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <h1 className="text-xl font-bold text-red-600 mb-2">
              Something went wrong
            </h1>
            <pre className="text-sm text-gray-600 bg-gray-100 p-3 rounded-lg overflow-auto max-w-md">
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

type Page = "home" | "map" | "account" | "admin";

function MapRouteWrapper({
  incidents,
  userLocation,
}: {
  incidents: Incident[];
  userLocation: {
    latitude: number;
    longitude: number;
    address?: string | null;
  } | null;
}) {
  const { id } = useParams<{ id?: string }>();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    () => (id ? incidents.find((i) => i.id === id) || null : null)
  );

  return (
    <MapPage
      incidents={incidents}
      selectedIncident={selectedIncident}
      onIncidentSelect={setSelectedIncident}
      incidentIdFromUrl={id || null}
      userLocation={userLocation}
    />
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const currentPage: Page = location.pathname.startsWith("/map")
    ? "map"
    : location.pathname === "/account"
    ? "account"
    : location.pathname === "/admin"
    ? "admin"
    : "home";

  const [detailIncident, setDetailIncident] = useState<Incident | null>(null);
  const [showNewIncidentForm, setShowNewIncidentForm] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    latitude,
    longitude,
    address,
    loading: locationLoading,
    requestPermission,
  } = useGeolocation(true);

  const userLocation =
    latitude && longitude ? { latitude, longitude, address } : null;

  // Fetch incidents and setup socket connection when location is available
  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchIncidents = async (skipCache = false) => {
      // Try to load from cache first for instant display
      if (!skipCache) {
        const cached = incidentCache.get(latitude, longitude);
        if (cached && cached.length > 0) {
          setIncidents(cached);
          setLoadingIncidents(false);
          // Still fetch fresh data in background
          setIsRefreshing(true);
        }
      }

      try {
        if (!skipCache && incidents.length === 0) {
          setLoadingIncidents(true);
        }
        const data = await api.getNearbyIncidents(latitude, longitude);
        setIncidents(data);
        // Cache the fresh data
        incidentCache.set(data, latitude, longitude);
      } catch (error) {
        console.error("Failed to fetch incidents:", error);
      } finally {
        setLoadingIncidents(false);
        setIsRefreshing(false);
      }
    };

    fetchIncidents();

    // Setup socket connection
    socketService.connect();
    socketService.joinArea(latitude, longitude);

    socketService.onNewIncident((incident) => {
      setIncidents((prev) => {
        const updated = [incident, ...prev];
        incidentCache.update(updated);
        return updated;
      });
    });

    socketService.onIncidentUpdate((updated) => {
      setIncidents((prev) => {
        const newList = prev.map((inc) =>
          inc.id === updated.id ? updated : inc
        );
        incidentCache.update(newList);
        return newList;
      });
    });

    return () => {
      socketService.offNewIncident();
      socketService.offIncidentUpdate();
      socketService.disconnect();
    };
  }, [latitude, longitude]);

  const navigateToIncident = (incident: Incident) => {
    navigate(`/map/${incident.id}`);
    setDetailIncident(null);
  };

  const handlePageChange = (page: Page) => {
    switch (page) {
      case "home":
        navigate("/");
        break;
      case "map":
        navigate("/map");
        break;
      case "account":
        navigate("/account");
        break;
      case "admin":
        navigate("/admin");
        break;
    }
  };

  const handleNewIncidentSubmit = async (data: {
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const payload: CreateIncidentPayload = {
        type: data.category || data.title,
        description: data.description,
        lat: data.latitude,
        lng: data.longitude,
      };
      const response = await api.createIncident(payload);

      if (response.isDuplicate) {
        // Update existing incident in list
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === response.incident.id ? response.incident : inc
          )
        );
        alert(
          response.message ||
            "Similar incident already reported. Your confirmation has been added!"
        );
      } else {
        // Add new incident to list
        setIncidents((prev) => [response.incident, ...prev]);
      }
    } catch (error) {
      console.error("Failed to create incident:", error);
      alert("Failed to report incident. Please try again.");
    }
  };

  const dockItems = [
    {
      icon: <Home size={20} />,
      label: "Home",
      onClick: () => handlePageChange("home"),
      isActive: currentPage === "home",
    },
    {
      icon: <Map size={20} />,
      label: "Map",
      onClick: () => handlePageChange("map"),
      isActive: currentPage === "map",
    },
    ...(isAdmin
      ? [
          {
            icon: <Shield size={20} />,
            label: "Admin",
            onClick: () => handlePageChange("admin"),
            isActive: currentPage === "admin",
          },
        ]
      : []),
    {
      icon: <User size={20} />,
      label: "Account",
      onClick: () => handlePageChange("account"),
      isActive: currentPage === "account",
    },
  ];

  return (
    <ErrorBoundary>
      <div className="w-full h-screen flex flex-col overflow-hidden bg-gray-50">
        <MobileHeader
          address={address}
          loading={locationLoading}
          onEmergencyClick={() => setShowEmergencyModal(true)}
          onLocationClick={requestPermission}
        />

        <div className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 z-20">
          <div className="flex items-center">
            <img
              src="/rescuebanner.png"
              alt="RescueLink"
              className="h-10 object-contain"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewIncidentForm(true)}
              className="px-4 py-2 bg-linear-to-r from-sky-500 to-sky-600 text-white font-medium rounded-xl text-sm shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Report Incident
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-sky-600"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              <span className="text-sm text-gray-700 max-w-50 truncate">
                {locationLoading
                  ? "Getting location..."
                  : address?.split(",")[0] || "Set location"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  incidents={incidents}
                  userLocation={userLocation}
                  onIncidentClick={(incident) => setDetailIncident(incident)}
                  onNavigate={navigateToIncident}
                  isLoading={loadingIncidents}
                  isRefreshing={isRefreshing}
                />
              }
            />
            <Route
              path="/map/:id?"
              element={
                <MapRouteWrapper
                  incidents={incidents}
                  userLocation={userLocation}
                />
              }
            />
            <Route path="/account" element={<AccountPage />} />
            <Route
              path="/admin"
              element={
                <AdminDashboard
                  onIncidentClick={(incident) => setDetailIncident(incident)}
                />
              }
            />
          </Routes>
        </div>

        <MobileBottomNav
          activePage={currentPage}
          onPageChange={handlePageChange}
          onAddIncident={() => setShowNewIncidentForm(true)}
        />

        <div className="hidden md:block">
          <Dock items={dockItems} />
        </div>

        <NewIncidentForm
          isOpen={showNewIncidentForm}
          onClose={() => setShowNewIncidentForm(false)}
          userLocation={userLocation}
          onSubmit={handleNewIncidentSubmit}
        />

        <EmergencyModal
          isOpen={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
        />

        <IncidentDetailModal
          incident={detailIncident}
          onClose={() => setDetailIncident(null)}
          onNavigate={navigateToIncident}
          userLocation={userLocation}
          onUpdate={(updated) => {
            setIncidents((prev) =>
              prev.map((inc) => (inc.id === updated.id ? updated : inc))
            );
            setDetailIncident(updated);
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
