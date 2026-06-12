import { createContext, useContext, useEffect } from 'react';
import { themePresets } from '../config/themes';
import { templateConfig } from '../config/template.config';

const TemplateContext = createContext();

export function TemplateProvider({ children }) {
  const presetKey = templateConfig.theme.preset || 'sketch';
  const activePreset = themePresets[presetKey] || themePresets.sketch;

  useEffect(() => {
    // 1. Inject CSS variables into document root
    const root = document.documentElement;
    if (activePreset.variables) {
      Object.entries(activePreset.variables).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    }

    // Apply font-family to root variable and document body
    if (activePreset.fontFamily) {
      root.style.setProperty('--font-family', activePreset.fontFamily);
      document.body.style.fontFamily = activePreset.fontFamily;
    }

    // 2. Load Google Fonts dynamically
    let fontLink = document.getElementById('template-google-font');
    if (activePreset.googleFontUrl) {
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.id = 'template-google-font';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
      }
      fontLink.href = activePreset.googleFontUrl;
    } else if (fontLink) {
      fontLink.remove();
    }

    // 3. Load Custom CSS dynamically if configured
    let customCssLink = document.getElementById('template-custom-css');
    if (templateConfig.customCssPath) {
      if (!customCssLink) {
        customCssLink = document.createElement('link');
        customCssLink.id = 'template-custom-css';
        customCssLink.rel = 'stylesheet';
        document.head.appendChild(customCssLink);
      }
      customCssLink.href = templateConfig.customCssPath;
    } else if (customCssLink) {
      customCssLink.remove();
    }
  }, [presetKey, activePreset]);

  const value = {
    preset: presetKey,
    config: templateConfig,
    enableWobbleFilters: !!activePreset.enableWobbleFilters,
    enableHanddrawnIcons: !!activePreset.enableHanddrawnIcons,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    // Safe default fallback values for unit tests and isolated component renders
    return {
      preset: 'sketch',
      config: {
        theme: { preset: 'sketch' },
        layout: {
          sections: [
            { id: 'hero', enabled: true },
            { id: 'skills', enabled: true },
            { id: 'projects', enabled: true },
            { id: 'contact', enabled: true },
          ]
        }
      },
      enableWobbleFilters: true,
      enableHanddrawnIcons: true,
    };
  }
  return context;
}
