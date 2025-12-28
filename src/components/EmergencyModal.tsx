import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Ambulance,
  Flame,
  Phone,
  Shield,
  X,
} from "lucide-react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emergencyContacts = [
  {
    id: "police",
    name: "Police",
    number: "100",
    icon: Shield,
    color: "bg-blue-500",
    description: "For crime, theft, or public safety",
  },
  {
    id: "ambulance",
    name: "Ambulance",
    number: "102",
    icon: Ambulance,
    color: "bg-red-500",
    description: "Medical emergencies",
  },
  {
    id: "fire",
    name: "Fire Brigade",
    number: "101",
    icon: Flame,
    color: "bg-orange-500",
    description: "Fire emergencies",
  },
  {
    id: "disaster",
    name: "Disaster Management",
    number: "108",
    icon: AlertTriangle,
    color: "bg-yellow-500",
    description: "Natural disasters & emergencies",
  },
  {
    id: "emergency",
    name: "National Emergency",
    number: "112",
    icon: Phone,
    color: "bg-green-500",
    description: "All-in-one emergency number",
  },
];

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 z-50 bg-white rounded-2xl max-w-md mx-auto overflow-hidden shadow-2xl"
          >
            <div className="bg-red-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone size={20} className="text-white" />
                <h2 className="text-lg font-bold text-white">
                  Emergency Contacts
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/20 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="bg-red-50 px-4 py-2 border-b border-red-100">
              <p className="text-xs text-red-600 text-center">
                Only call in case of genuine emergencies
              </p>
            </div>

            <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
              {emergencyContacts.map((contact) => {
                const Icon = contact.icon;
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleCall(contact.number)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <div
                      className={`w-12 h-12 ${contact.color} rounded-xl flex items-center justify-center shadow-md`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contact.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">
                        {contact.number}
                      </p>
                      <p className="text-xs text-sky-600">Tap to call</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-gray-100">
              <button
                onClick={onClose}
                className="w-full py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
