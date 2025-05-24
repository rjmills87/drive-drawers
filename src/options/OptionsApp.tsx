import "../options/OptionsApp.css";
import { useState, useEffect } from "react";
import ToggleSwitch from "../components/ui/ToggleSwitch";

interface OptionsState {
  defaultService: string;
  autoSync: boolean;
  theme: string;
  cacheSize: number;
}

const defaultOptions: OptionsState = {
  defaultService: "google-drive",
  autoSync: true,
  theme: "light",
  cacheSize: 100,
};

// Type-safe storage wrapper
const storage = {
  sync: {
    get: function <T>(
      key: string | string[] | object,
      callback: (result: { [key: string]: T }) => void
    ): void {
      try {
        if (
          typeof chrome !== "undefined" &&
          chrome.storage &&
          chrome.storage.sync
        ) {
          (
            chrome.storage.sync as unknown as {
              get: <U>(
                key: string | string[] | object,
                callback: (result: { [key: string]: U }) => void
              ) => void;
            }
          ).get<T>(key, callback);
        } else {
          // Development fallback - use localStorage
          const data = localStorage.getItem("driveDrawers_options");
          callback(
            data
              ? { options: JSON.parse(data) as unknown as T }
              : ({} as { [key: string]: T })
          );
        }
      } catch (error) {
        console.error("Error in storage.get:", error);
        callback({} as { [key: string]: T });
      }
    },
    set: function (items: object, callback?: () => void): void {
      try {
        if (
          typeof chrome !== "undefined" &&
          chrome.storage &&
          chrome.storage.sync
        ) {
          (
            chrome.storage.sync as unknown as {
              set: (items: object, callback?: () => void) => void;
            }
          ).set(items, callback);
        } else {
          // Development fallback - use localStorage
          localStorage.setItem(
            "driveDrawers_options",
            JSON.stringify((items as { options: unknown }).options)
          );
          if (callback) callback();
        }
      } catch (error) {
        console.error("Error in storage.set:", error);
        if (callback) callback();
      }
    },
  },
};

function OptionsApp() {
  const [options, setOptions] = useState<OptionsState>({
    defaultService: "google-drive",
    autoSync: true,
    theme: "light",
    cacheSize: 100,
  });

  useEffect(() => {
    // Load saved settings
    storage.sync.get<OptionsState>("options", (result) => {
      if (
        result.options &&
        typeof result.options === "object" &&
        "defaultService" in result.options &&
        "autoSync" in result.options &&
        "theme" in result.options &&
        "cacheSize" in result.options
      ) {
        setOptions(result.options as OptionsState);
      }
    });
  }, []);

  const [savedStatus, setSavedStatus] = useState<string>("");

  const saveSettings = () => {
    storage.sync.set({ options });
    setSavedStatus("Settings saved successfully!");
    setTimeout(() => {
      setSavedStatus("");
    }, 3000);
  };

  const resetToDefaults = () => {
    setOptions({ ...defaultOptions });
    storage.sync.set({ options: defaultOptions });
    setSavedStatus("Settings reset to default");
    setTimeout(() => {
      setSavedStatus("");
    }, 3000);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-8 underline">Options</h1>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold underline">General Settings</h2>
        {/* Default Service */}
        <div className="flex justify-start items-center gap-4">
          <h3 className="text-lg font-bold">Default Cloud Service:</h3>
          <select
            value={options.defaultService}
            onChange={(e) =>
              setOptions({ ...options, defaultService: e.target.value })
            }
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="google-drive">Google Drive</option>
            <option value="microsoft-onedrive">Microsoft OneDrive</option>
            <option value="dropbox">Dropbox</option>
          </select>
        </div>
        {/* Auto-Sync Toggle */}
        <div className="flex items-center gap-4.5">
          <h3 className="text-lg font-bold">Auto-Sync:</h3>
          <div className="flex items-center gap-3">
            <span>Off</span>
            <ToggleSwitch
              isOn={options.autoSync}
              onToggle={() =>
                setOptions({ ...options, autoSync: !options.autoSync })
              }
            />
            <span>On</span>
          </div>
        </div>
        <h2 className="text-xl font-bold underline">Appearance</h2>
        <div className="flex justify-start items-center gap-4">
          <h3 className="text-lg font-bold">Theme:</h3>
          <span>Light</span>
          <ToggleSwitch
            isOn={options.theme === "dark"}
            onToggle={() =>
              setOptions({
                ...options,
                theme: options.theme === "dark" ? "light" : "dark",
              })
            }
          />
          <span>Dark</span>
        </div>
        {/* Advanced Settings Section */}
        <h2 className="text-xl font-bold underline mt-4">Advanced Settings</h2>
        <div className="flex justify-start items-center gap-4">
          <h3 className="text-lg font-bold">Cache Size (MB):</h3>
          <input
            type="number"
            min="10"
            max="1000"
            value={options.cacheSize}
            onChange={(e) =>
              setOptions({
                ...options,
                cacheSize: parseInt(e.target.value, 10) || 100, // Default to 100 if invalid
              })
            }
            className="border border-gray-300 rounded-md p-2 w-24"
          />
        </div>
        {/* Save Settings */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={saveSettings}
            className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
          >
            Save Settings
          </button>
          <button
            onClick={resetToDefaults}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Reset to Defaults
          </button>
        </div>
        {savedStatus && (
          <div className="text-green-600 mt-2">{savedStatus}</div>
        )}
      </div>
    </div>
  );
}

export default OptionsApp;
