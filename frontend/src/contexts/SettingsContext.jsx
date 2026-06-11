import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { soundSynth } from '../utils/audioSynth';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    enableDoodly: true,
    enableSounds: true,
    enableBug: true,
    enablePageTear: true,
    enableInkLeak: true,
    enableCoffeeSpill: true,
    enableDrawSkills: true,
    enableEraser: true,
    enableCrumpledPageTransition: true,
    showAdminLink: true,
  });
  const [loading, setLoading] = useState(true);

  // Sync enableSounds with soundSynth
  useEffect(() => {
    if (settings) {
      soundSynth.setSettingsMuted(!settings.enableSounds);
    }
  }, [settings?.enableSounds]);

  const fetchSettings = async () => {
    try {
      // Use portfolio endpoint for public settings fetching
      const res = await api.get('/portfolio/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettingsLocally = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        updateSettingsLocally,
        refreshSettings: fetchSettings,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function usePortfolioSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      'usePortfolioSettings must be used within a SettingsProvider'
    );
  }
  return context;
}
