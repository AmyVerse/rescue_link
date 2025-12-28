import {
  Bell,
  ChevronRight,
  HelpCircle,
  Info,
  LogOut,
  MapPin,
  Moon,
  Settings,
  Shield,
  User,
} from "lucide-react";

interface AccountPageProps {
  onMenuItemClick?: (item: string) => void;
}

const menuItems = [
  { id: "profile", label: "Your Profile", icon: User },
  { id: "location", label: "Your Places", icon: MapPin },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

export const AccountPage: React.FC<AccountPageProps> = ({
  onMenuItemClick,
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 pt-14 md:pt-0 pb-24 md:pb-28 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto flex flex-col">
        <div className="hidden md:block mx-4 md:mx-6 mt-4 p-4 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
        </div>

        <div className="bg-white mx-4 md:mx-6 mt-4 p-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
              U
            </div>
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                User Name
              </h2>
              <p className="text-sm text-gray-500">user@email.com</p>
              <button className="mt-1 text-sm text-sky-600 font-medium">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="mx-4 md:mx-6 mt-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
          <div className="flex gap-3">
            <div className="shrink-0">
              <Info size={20} className="text-sky-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-sky-800 mb-1">
                Your Privacy Matters
              </h3>
              <p className="text-xs text-sky-700 leading-relaxed">
                We <strong>do not store or track</strong> your location until
                you explicitly submit an incident report. Your location data is
                only used at the moment of submission to help responders find
                the incident. We never sell or share your location history with
                third parties.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white mx-4 md:mx-6 mt-4 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Moon size={20} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Dark Mode
              </span>
            </div>
            <button className="w-12 h-7 bg-gray-200 rounded-xl relative transition-colors">
              <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-xl shadow-sm transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-white mx-4 md:mx-6 mt-4 rounded-xl border border-gray-100 divide-y divide-gray-100">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onMenuItemClick?.(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Icon size={20} className="text-gray-600" />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            );
          })}
        </div>

        <div className="mx-4 md:mx-6 mt-4 mb-6">
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium text-sm">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="text-center pb-4">
          <img
            src="/rescue.png"
            alt="RescueLink"
            className="w-12 h-12 mx-auto mb-2 opacity-50"
          />
          <p className="text-xs text-gray-400">RescueLink v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">
            <button className="hover:text-gray-600">Terms</button>
            <span className="mx-2">•</span>
            <button className="hover:text-gray-600">Privacy</button>
            <span className="mx-2">•</span>
            <button className="hover:text-gray-600">Licenses</button>
          </p>
        </div>
      </div>
    </div>
  );
};
