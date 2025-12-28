export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  latitude: number;
  longitude: number;
  timestamp: Date;
  responders?: number;
}
