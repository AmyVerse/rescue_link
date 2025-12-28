import { ChevronDown, MapPin, Phone } from "lucide-react";

interface MobileHeaderProps {
  address: string | null;
  loading: boolean;
  onEmergencyClick: () => void;
  onLocationClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  address,
  loading,
  onEmergencyClick,
  onLocationClick,
}) => {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-2.5 safe-area-top">
      <div className="flex items-center justify-between gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src="/rescue.png"
            alt="RescueLink"
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={onLocationClick}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <MapPin size={14} className="text-sky-600 shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate max-w-36">
            {loading ? (
              <span className="text-gray-400">Locating...</span>
            ) : address ? (
              address.split(",")[0]
            ) : (
              <span className="text-gray-400">Set location</span>
            )}
          </span>
          <ChevronDown size={12} className="text-gray-400 shrink-0" />
        </button>

        <button
          onClick={onEmergencyClick}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-500 rounded-full shadow-md active:scale-95 transition-transform shrink-0"
          aria-label="Emergency contacts"
        >
          <Phone size={14} className="text-white" />
          <span className="text-white text-xs font-semibold">SOS</span>
        </button>
      </div>
    </header>
  );
};
