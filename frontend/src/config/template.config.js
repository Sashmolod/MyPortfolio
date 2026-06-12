export const templateConfig = {
  theme: {
    preset: 'sketch', // 'sketch' | 'minimalist' | 'brutalist' | 'custom'
  },
  layout: {
    sections: [
      { id: 'hero', enabled: true },
      { id: 'skills', enabled: true },
      { id: 'projects', enabled: true },
      { id: 'contact', enabled: true },
    ]
  },
  customCssPath: '', // e.g., '/uploads/my-custom-style.css'
};

// Component Slot Registry for component overrides
export const ComponentRegistry = {
  Header: {},
  Footer: {},
};
