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
  ShieldCheck,
  User,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { useAuth, type UserRole } from "../context/AuthContext";

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
  const { name, role, isLoggedIn, login, logout, switchRole, isAdmin } =
    useAuth();
  const [inputName, setInputName] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");

  const handleLogin = () => {
    if (inputName.trim()) {
      login(inputName.trim(), selectedRole);
      setShowLoginModal(false);
      setInputName("");
    }
  };

  const getInitial = () => {
    if (name) return name.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pt-14 md:pt-0 pb-24 md:pb-28 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto flex flex-col">
        <div className="hidden md:block mx-4 md:mx-6 mt-4 p-4 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
        </div>

        <div className="bg-white mx-4 md:mx-6 mt-4 p-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg ${
                isAdmin
                  ? "bg-linear-to-br from-amber-500 to-orange-600"
                  : "bg-linear-to-br from-sky-500 to-sky-600"
              }`}
            >
              {getInitial()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {isLoggedIn ? name : "Guest User"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? "bg-amber-100 text-amber-700"
                      : "bg-sky-100 text-sky-700"
                  }`}
                >
                  {isAdmin ? "Admin / Responder" : "User"}
                </span>
              </div>
              {!isLoggedIn ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="mt-2 text-sm text-sky-600 font-medium"
                >
                  Sign In
                </button>
              ) : (
                <button className="mt-1 text-sm text-sky-600 font-medium">
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Role Switcher - only show when logged in */}
        {isLoggedIn && (
          <div className="bg-white mx-4 md:mx-6 mt-4 p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Switch Role
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => switchRole("user")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                  role === "user"
                    ? "bg-sky-100 text-sky-700 ring-2 ring-sky-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <UserCircle size={18} />
                User
              </button>
              <button
                onClick={() => switchRole("admin")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                  role === "admin"
                    ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <ShieldCheck size={18} />
                Admin / Responder
              </button>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowLoginModal(false)}
            />
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 z-50 bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Sign In</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Login as
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("user")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                        selectedRole === "user"
                          ? "bg-sky-100 text-sky-700 ring-2 ring-sky-500"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <UserCircle size={18} />
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                        selectedRole === "admin"
                          ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <ShieldCheck size={18} />
                      Admin
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={!inputName.trim()}
                  className="w-full py-3 bg-linear-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign In
                </button>

                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full py-2 text-gray-500 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}

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
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium text-sm"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors font-medium text-sm"
            >
              <User size={18} />
              <span>Sign In</span>
            </button>
          )}
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
