import { Crosshair } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import type { Incident } from "../types/incident";

interface MapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onIncidentSelect: (incident: Incident) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

mapboxgl.accessToken =
  "pk.eyJ1IjoiYW15amkiLCJhIjoiY21qcGdvbGoyM2ZrcDNlcXpnbjcwenIwcSJ9.AGLOZqEvAhUuNPPl-AsbpQ";

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "#ff0000";
    case "high":
      return "#ff6600";
    case "medium":
      return "#ffaa00";
    case "low":
      return "#00aa00";
    default:
      return "#0000ff";
  }
};

const createPinSvg = (color: string, isSelected: boolean) => {
  const scale = isSelected ? 1.2 : 1;
  const strokeWidth = isSelected ? 2 : 0;
  const stroke = isSelected ? "white" : "none";
  const filter = isSelected
    ? `drop-shadow(0 0 8px ${color})`
    : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))";

  return `
    <svg width="${32 * scale}" height="${
    40 * scale
  }" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: ${filter};">
      <path d="M16 0C7.164 0 0 7.164 0 16c0 10 14.4 23.2 15.2 24 .4.4 1.2.4 1.6 0C17.6 39.2 32 26 32 16c0-8.836-7.164-16-16-16z" fill="${color}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      <circle cx="16" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>
  `;
};

export const MapComponent: React.FC<MapProps> = ({
  incidents,
  selectedIncident,
  onIncidentSelect,
  userLocation,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<
    Map<string, { marker: mapboxgl.Marker; element: HTMLDivElement }>
  >(new Map());
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const onIncidentSelectRef = useRef(onIncidentSelect);
  const selectedIncidentRef = useRef(selectedIncident);
  const userLocationRef = useRef(userLocation);

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.longitude, userLocation.latitude]
    : [77.1025, 28.7041]; // [lng, lat] for Mapbox

  useEffect(() => {
    onIncidentSelectRef.current = onIncidentSelect;
  }, [onIncidentSelect]);

  useEffect(() => {
    selectedIncidentRef.current = selectedIncident;
  }, [selectedIncident]);

  useEffect(() => {
    if (!map.current || !userLocation || selectedIncident) return;

    if (
      userLocationRef.current?.latitude !== userLocation.latitude ||
      userLocationRef.current?.longitude !== userLocation.longitude
    ) {
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        duration: 1500,
      });
    }
    userLocationRef.current = userLocation;
  }, [userLocation, selectedIncident]);

  const isRotatingRef = useRef(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      center: defaultCenter,
      zoom: 17,
      maxZoom: 20,
      minZoom: 4,
      maxBounds: [
        [68.0, 6.5], // Southwest: [lng, lat]
        [97.5, 37.5], // Northeast: [lng, lat]
      ],
      pitch: 45,
      bearing: -20,
      antialias: true,
      fadeDuration: 0,
      trackResize: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("style.load", () => {
      map.current?.setFog({
        color: "rgb(220, 230, 240)",
        "high-color": "rgb(100, 150, 200)",
        "horizon-blend": 0.01,
      });
    });

    const spinGlobe = () => {
      if (!map.current || !isRotatingRef.current || document.hidden) return;
      if (!selectedIncidentRef.current) return;
      map.current.easeTo({
        bearing: map.current.getBearing() + 30,
        duration: 30000,
        easing: (t) => t,
      });
    };

    map.current.on("moveend", spinGlobe);

    const handleVisibility = () => {
      if (document.hidden) {
        map.current?.stop();
      } else if (isRotatingRef.current) {
        spinGlobe();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const stopRotation = () => {
      isRotatingRef.current = false;
      map.current?.stop();
    };

    let resumeTimeout: ReturnType<typeof setTimeout>;
    const scheduleResume = () => {
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        isRotatingRef.current = true;
        spinGlobe();
      }, 200);
    };

    map.current.on("mousedown", stopRotation);
    map.current.on("touchstart", stopRotation);
    map.current.on("wheel", stopRotation);

    map.current.on("mouseup", scheduleResume);
    map.current.on("touchend", scheduleResume);
    map.current.on("wheel", scheduleResume);

    return () => {
      clearTimeout(resumeTimeout);
      document.removeEventListener("visibilitychange", handleVisibility);
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const currentIds = new Set(incidents.map((i) => i.id));
    markersRef.current.forEach((value, id) => {
      if (!currentIds.has(id)) {
        value.marker.remove();
        markersRef.current.delete(id);
      }
    });

    incidents.forEach((incident) => {
      if (!markersRef.current.has(incident.id)) {
        const color = getSeverityColor(incident.severity);

        const el = document.createElement("div");
        el.className = "incident-marker";
        el.dataset.incidentId = incident.id;
        el.innerHTML = createPinSvg(color, false);
        el.style.cursor = "pointer";

        el.addEventListener("click", () => {
          onIncidentSelectRef.current(incident);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([incident.longitude, incident.latitude])
          .addTo(map.current!);

        markersRef.current.set(incident.id, { marker, element: el });
      }
    });
  }, [incidents]);

  useEffect(() => {
    markersRef.current.forEach((value, id) => {
      const incident = incidents.find((i) => i.id === id);
      if (!incident) return;

      const isSelected = selectedIncident?.id === id;
      const color = getSeverityColor(incident.severity);

      value.element.innerHTML = createPinSvg(color, isSelected);
    });
  }, [selectedIncident, incidents]);

  useEffect(() => {
    if (!map.current || !selectedIncident) {
      isRotatingRef.current = false;
      map.current?.stop();
      return;
    }

    isRotatingRef.current = true;

    map.current.flyTo({
      center: [selectedIncident.longitude, selectedIncident.latitude],
      zoom: 17,
      duration: 1500,
      essential: true,
    });
  }, [selectedIncident]);

  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([
        userLocation.longitude,
        userLocation.latitude,
      ]);
    } else {
      const el = document.createElement("div");
      el.className = "user-location-marker";
      el.innerHTML = `
        <div class="user-tag">You're here<div class="user-tag-pointer"></div></div>
        <div class="user-pulse"></div>
      `;

      userMarkerRef.current = new mapboxgl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current);
    }
  }, [userLocation]);

  const handleRecenterToUser = () => {
    if (!map.current || !userLocation) return;
    map.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 17,
      duration: 1200,
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {userLocation && (
        <button
          onClick={handleRecenterToUser}
          className="absolute bottom-24 md:bottom-28 right-16 z-10 bg-gray-50 px-3 py-2.5 rounded-xl shadow-lg hover:bg-blue-100 active:scale-95 transition-all border border-gray-200 flex items-center gap-2"
          aria-label="Go to my location"
        >
          <Crosshair size={18} className="text-sky-500" strokeWidth={2} />
          <span className="text-sm font-medium text-gray-700">My Location</span>
        </button>
      )}
    </div>
  );
};
