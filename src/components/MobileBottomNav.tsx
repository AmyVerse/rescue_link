import { Home, Map, Plus, User } from "lucide-react";

type Page = "home" | "map" | "account";

interface MobileBottomNavProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  onAddIncident: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePage,
  onPageChange,
  onAddIncident,
}) => {
  return (
    <>
      <button
        onClick={onAddIncident}
        className="md:hidden fixed bottom-20 right-4 z-30 w-12 h-12 bg-linear-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
        aria-label="Report new incident"
      >
        <Plus size={22} className="text-white" strokeWidth={2.5} />
      </button>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex items-center justify-around py-1.5 px-2">
          <button
            onClick={() => onPageChange("home")}
            className={`flex flex-col items-center gap-0.5 py-2 px-8 rounded-2xl transition-all ${
              activePage === "home"
                ? "text-sky-600 bg-sky-50"
                : "text-gray-400 active:bg-gray-50"
            }`}
          >
            <Home size={20} strokeWidth={activePage === "home" ? 2.5 : 1.5} />
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <button
            onClick={() => onPageChange("map")}
            className={`flex flex-col items-center gap-0.5 py-2 px-8 rounded-2xl transition-all ${
              activePage === "map"
                ? "text-sky-600 bg-sky-50"
                : "text-gray-400 active:bg-gray-50"
            }`}
          >
            <Map size={20} strokeWidth={activePage === "map" ? 2.5 : 1.5} />
            <span className="text-[10px] font-semibold">Map</span>
          </button>

          <button
            onClick={() => onPageChange("account")}
            className={`flex flex-col items-center gap-0.5 py-2 px-8 rounded-2xl transition-all ${
              activePage === "account"
                ? "text-sky-600 bg-sky-50"
                : "text-gray-400 active:bg-gray-50"
            }`}
          >
            <User
              size={20}
              strokeWidth={activePage === "account" ? 2.5 : 1.5}
            />
            <span className="text-[10px] font-semibold">Account</span>
          </button>
        </div>
      </nav>
    </>
  );
};
