import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  Flame,
  Home,
  MapPin,
  Plus,
  Stethoscope,
  X,
} from "lucide-react";
import { useState } from "react";

interface NewIncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: {
    latitude: number;
    longitude: number;
    address: string | null;
  } | null;
  onSubmit: (data: IncidentFormData) => void;
}

export interface IncidentFormData {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  latitude: number;
  longitude: number;
  photo?: File | null;
}

const severityOptions = [
  {
    id: "low",
    label: "Low",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    id: "medium",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    id: "high",
    label: "High",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    id: "critical",
    label: "Critical",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

const categoryOptions = [
  { id: "fire", label: "Fire", icon: Flame },
  { id: "accident", label: "Accident", icon: AlertTriangle },
  { id: "medical", label: "Medical", icon: Stethoscope },
  { id: "natural", label: "Natural Disaster", icon: Home },
  { id: "other", label: "Other", icon: Plus },
];

export const NewIncidentForm: React.FC<NewIncidentFormProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [category, setCategory] = useState("accident");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLocation) return;

    onSubmit({
      title,
      description,
      severity,
      category,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      photo,
    });

    setTitle("");
    setDescription("");
    setSeverity("medium");
    setCategory("accident");
    setPhoto(null);
    setPhotoPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-white rounded-t-3xl md:rounded-2xl md:w-full md:max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                Report Incident
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              <div className="flex items-center gap-2 px-3 py-2.5 bg-sky-50 rounded-xl border border-sky-100">
                <MapPin size={18} className="text-sky-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-sky-600 font-medium">
                    Using your current location
                  </p>
                  <p className="text-sm text-gray-700 truncate">
                    {userLocation?.address || "Getting location..."}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of the incident"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          category === cat.id
                            ? "bg-sky-100 text-sky-700 ring-2 ring-sky-500"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <Icon size={14} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Severity <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {severityOptions.map((sev) => (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => setSeverity(sev.id as typeof severity)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        severity === sev.id
                          ? sev.color + " ring-2 ring-offset-1 ring-gray-300"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional details about the incident..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-gray-800 placeholder:text-gray-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Photo (Optional)
                </label>
                {photoPreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-xl"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
                    <Camera size={24} className="text-gray-400 mb-1" />
                    <span className="text-sm text-gray-500">
                      Tap to add photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </form>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!title || !userLocation}
                className="w-full py-3 bg-linear-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                Submit Report
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
