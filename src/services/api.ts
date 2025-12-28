import { io, Socket } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Backend response structure
export interface BackendIncident {
  id: number;
  type: string;
  description: string;
  status: "unverified" | "verified" | "false" | "resolved";
  confirmations: number;
  trust_score: number;
  priority_score: number;
  created_at: string;
}

// Frontend Incident with lat/lng added from nearby query
export interface Incident {
  id: string;
  type: string;
  description: string;
  lat: number;
  lng: number;
  status: "unverified" | "verified" | "false" | "resolved";
  confirmations: number;
  trustScore: number;
  priorityScore: number;
  createdAt: string;
}

export interface CreateIncidentPayload {
  type: string;
  description: string;
  lat: number;
  lng: number;
}

// Response when creating an incident that might be a duplicate
export interface CreateIncidentResponse {
  incident: Incident;
  isDuplicate: boolean;
  message?: string;
}

// Transform backend response to frontend format
const transformIncident = (
  backend: BackendIncident,
  lat?: number,
  lng?: number
): Incident => ({
  id: String(backend.id),
  type: backend.type,
  description: backend.description,
  lat: lat ?? 0,
  lng: lng ?? 0,
  status: backend.status,
  confirmations: backend.confirmations,
  trustScore: backend.trust_score,
  priorityScore: backend.priority_score,
  createdAt: backend.created_at,
});

// REST API calls
export const api = {
  async createIncident(
    payload: CreateIncidentPayload
  ): Promise<CreateIncidentResponse> {
    const res = await fetch(`${BASE_URL}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to create incident: ${error}`);
    }

    const data = await res.json();

    // Check if this was a duplicate (status 200 with message)
    if (data.message && data.incident) {
      return {
        incident: transformIncident(data.incident, payload.lat, payload.lng),
        isDuplicate: true,
        message: data.message,
      };
    }

    // New incident created (status 201)
    return {
      incident: transformIncident(data, payload.lat, payload.lng),
      isDuplicate: false,
    };
  },

  async getNearbyIncidents(
    lat: number,
    lng: number,
    radius?: number
  ): Promise<Incident[]> {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    if (radius) params.append("radius", String(radius));
    const res = await fetch(`${BASE_URL}/incidents/nearby?${params}`);
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to fetch incidents: ${error}`);
    }
    const backends: BackendIncident[] = await res.json();
    // Note: Backend nearby endpoint should ideally return lat/lng
    // For now, we use the query location as approximate
    return backends.map((b) => transformIncident(b, lat, lng));
  },

  async confirmIncident(id: string): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/incidents/${id}/confirm`, {
      method: "POST",
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to confirm incident: ${error}`);
    }
    const backend: BackendIncident = await res.json();
    return transformIncident(backend);
  },

  async markIncidentFalse(id: string): Promise<{ status: string }> {
    const res = await fetch(`${BASE_URL}/incidents/${id}/false`, {
      method: "POST",
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to mark incident as false: ${error}`);
    }
    return res.json();
  },

  async evaluateFalseIncidents(): Promise<{
    checked: number;
    updated: number;
  }> {
    const res = await fetch(`${BASE_URL}/incidents/evaluate-false`, {
      method: "POST",
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to evaluate false incidents: ${error}`);
    }
    return res.json();
  },

  // Admin endpoint - get all incidents sorted by priority
  async getAdminIncidents(): Promise<Incident[]> {
    const res = await fetch(`${BASE_URL}/admin/incidents`);
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to fetch admin incidents: ${error}`);
    }
    const backends: BackendIncident[] = await res.json();
    return backends.map((b) => transformIncident(b));
  },
};

// Socket.IO connection
let socket: Socket | null = null;

export const socketService = {
  connect(): Socket {
    if (!socket) {
      // Use empty string for same-origin when proxied, or full URL for production
      const socketUrl = SOCKET_URL || window.location.origin;
      socket = io(socketUrl, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      });
    }
    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  joinArea(lat: number, lng: number) {
    if (socket) {
      socket.emit("join_area", { lat, lng });
    }
  },

  leaveArea(lat: number, lng: number) {
    if (socket) {
      socket.emit("leave_area", { lat, lng });
    }
  },

  onNewIncident(callback: (incident: Incident) => void) {
    if (socket) {
      socket.on("incident:new", callback);
    }
  },

  onIncidentUpdate(callback: (incident: Incident) => void) {
    if (socket) {
      socket.on("incident:update", callback);
    }
  },

  offNewIncident() {
    if (socket) socket.off("incident:new");
  },

  offIncidentUpdate() {
    if (socket) socket.off("incident:update");
  },
};
