// Re-export from api.ts for backwards compatibility
export type { CreateIncidentPayload, Incident } from "../services/api";
import type { Incident } from "../services/api";

// Incident types supported by backend with their priority values
export const INCIDENT_TYPES = {
  fire: 9,
  medical: 8,
  accident: 7,
  infrastructure: 6,
  disturbance: 5,
} as const;

export type IncidentType = keyof typeof INCIDENT_TYPES;

// Incident status types
export type IncidentStatus = "unverified" | "verified" | "false" | "resolved";

// Helper to derive severity from priority_score for UI display
export type SeverityLevel = "critical" | "high" | "medium" | "low";

export function getSeverityFromIncident(incident: Incident): SeverityLevel {
  // Use priorityScore from backend calculation
  const score = incident.priorityScore ?? 0;

  if (score >= 8) return "critical";
  if (score >= 6) return "high";
  if (score >= 4) return "medium";
  return "low";
}

// Get color based on incident type
export function getIncidentTypeColor(type: string): string {
  switch (type) {
    case "fire":
      return "text-orange-600 bg-orange-100";
    case "medical":
      return "text-red-600 bg-red-100";
    case "accident":
      return "text-yellow-600 bg-yellow-100";
    case "infrastructure":
      return "text-blue-600 bg-blue-100";
    case "disturbance":
      return "text-purple-600 bg-purple-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

// Get label for status
export function getStatusLabel(status: IncidentStatus): string {
  switch (status) {
    case "unverified":
      return "Unverified";
    case "verified":
      return "Verified";
    case "false":
      return "False Report";
    case "resolved":
      return "Resolved";
  }
}

// Get color for status
export function getStatusColor(status: IncidentStatus): string {
  switch (status) {
    case "unverified":
      return "text-yellow-600 bg-yellow-100";
    case "verified":
      return "text-green-600 bg-green-100";
    case "false":
      return "text-red-600 bg-red-100";
    case "resolved":
      return "text-gray-600 bg-gray-100";
  }
}
