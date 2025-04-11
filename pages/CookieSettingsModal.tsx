// components/CookieSettingsModal.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: Record<string, boolean>) => void;
}

const CookieSettingsModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [prefs, setPrefs] = useState({
    analytics: true,
    marketing: false,
  });

  if (!isOpen) return null;
  type CookieType = "analytics" | "marketing";

  const handleChange = (type: CookieType) => {
    setPrefs({ ...prefs, [type]: !prefs[type] });
  };
  

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Cookie Preferences</h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Essential Cookies</span>
            <span className="text-sm text-gray-500">Always active</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Analytics Cookies</span>
            <input
              type="checkbox"
              checked={prefs.analytics}
              onChange={() => handleChange("analytics")}
              className="w-5 h-5"
            />
          </div>

          <div className="flex justify-between items-center">
            <span>Marketing Cookies</span>
            <input
              type="checkbox"
              checked={prefs.marketing}
              onChange={() => handleChange("marketing")}
              className="w-5 h-5"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-black">Cancel</button>
          <button
            onClick={() => {
              onSave(prefs);
              onClose();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CookieSettingsModal;
