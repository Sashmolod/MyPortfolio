export const themePresets = {
  sketch: {
    fontFamily: "'Architects Daughter', cursive",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap",
    variables: {
      '--border-style': '2px solid var(--border-color)',
      '--sketch-radius-1': '255px 15px 225px 15px/15px 225px 15px 255px',
      '--sketch-radius-3': '20px 300px 10px 200px/10px 15px 20px 10px',
      '--shadow-preset': '3px 3px 0px var(--border-color)',
    },
    enableWobbleFilters: true,
    enableHanddrawnIcons: true,
  },
  minimalist: {
    fontFamily: "'Inter', sans-serif",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
    variables: {
      '--border-style': '1px solid var(--border-color)',
      '--sketch-radius-1': '8px',
      '--sketch-radius-3': '12px',
      '--shadow-preset': '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)',
    },
    enableWobbleFilters: false,
    enableHanddrawnIcons: false,
  },
  brutalist: {
    fontFamily: "'Space Grotesk', sans-serif",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap",
    variables: {
      '--border-style': '3px solid var(--border-color)',
      '--sketch-radius-1': '0px',
      '--sketch-radius-3': '0px',
      '--shadow-preset': '6px 6px 0px var(--border-color)',
    },
    enableWobbleFilters: false,
    enableHanddrawnIcons: false,
  },
  custom: {
    fontFamily: "'Inter', sans-serif",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
    variables: {
      '--border-style': '1px solid var(--border-color)',
      '--sketch-radius-1': '6px',
      '--sketch-radius-3': '10px',
      '--shadow-preset': '0px 2px 4px rgba(0,0,0,0.05)',
    },
    enableWobbleFilters: false,
    enableHanddrawnIcons: false,
  }
};
