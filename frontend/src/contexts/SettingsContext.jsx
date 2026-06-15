import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { soundSynth } from '../utils/audioSynth';

// ────────────────────────────────────────────────
//  Defaults
// ────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
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
};

// ────────────────────────────────────────────────
//  Context
// ────────────────────────────────────────────────
const SettingsContext = createContext(undefined);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Sync enableSounds with soundSynth
  useEffect(() => {
    soundSynth.setSettingsMuted(!settings.enableSounds);
  }, [settings.enableSounds]);

  const fetchSettings = async () => {
    try {
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

  const updateSettingsLocally = (partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
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
    throw new Error('usePortfolioSettings must be used within a SettingsProvider');
  }
  return context;
}
