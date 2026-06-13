import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import CoffeeCup from './creative/CoffeeCup';
import InkLeak from './creative/InkLeak';
import PageCrumpler from './creative/PageCrumpler';
import PageTear from './creative/PageTear';
import SketchyBug from './creative/SketchyBug';
import {
  DeveloperIllustration,
  TechIcon,
  ReactIcon,
  NodeIcon,
  PythonIcon,
  DatabaseIcon,
  DockerIcon,
  SqlIcon,
  RocketIcon,
  MailIcon,
  ProjectIcon,
  StarIcon,
  CodeIcon,
  BackgroundParticles,
  CheckIcon,
  LightningIcon,
  SketchLockIcon,
  SketchSunIcon,
  SketchMoonIcon,
  SketchSoundIcon,
} from './SvgIllustrations';

// Import mocked modules for asserting/spying
import { soundSynth } from '../utils/audioSynth';
import { usePortfolioSettings } from '../contexts/SettingsContext';

// Mock soundSynth
vi.mock('../utils/audioSynth', () => ({
  soundSynth: {
    playPop: vi.fn(),
    playSlosh: vi.fn(),
    playSplat: vi.fn(),
    playWhoosh: vi.fn(),
    playTear: vi.fn(),
    playTap: vi.fn(),
    playCrumple: vi.fn(),
    playPageFlip: vi.fn(),
    startScribble: vi.fn(),
    stopScribble: vi.fn(),
    setMuted: vi.fn(),
    setSettingsMuted: vi.fn(),
  },
}));

// Mock settings context with standard inline object to avoid TDZ hoisting issues
vi.mock('../contexts/SettingsContext', () => {
  const settings = {
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
  return {
    usePortfolioSettings: () => ({
      settings,
      setSettings: (newVal) => Object.assign(settings, newVal),
      updateSettingsLocally: (newVal) => Object.assign(settings, newVal),
    }),
    SettingsProvider: ({ children }) => children,
  };
});

// Mock framer-motion to bypass animation lag/async rendering using a Proxy
vi.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef(
    ({ children, onAnimationComplete, ...props }, ref) => {
      // Auto-fire onAnimationComplete to advance states instantly in tests
      React.useEffect(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, [onAnimationComplete]);
      return React.createElement('div', { ref, ...props }, children);
    }
  );
  const motionProxy = new Proxy(
    {},
    {
      get: (target, key) => {
        return Dummy;
      },
    }
  );
  return {
    motion: motionProxy,
    AnimatePresence: ({ children }) => children,
  };
});

describe('Interactive Components Spec', () => {
  beforeEach(() => {
    const { settings } = usePortfolioSettings();
    settings.enableCrumpledPageTransition = true;
    settings.enableCoffeeSpill = true;
    vi.clearAllMocks();
  });

  describe('CoffeeCup Component', () => {
    it('renders with initial label', () => {
      render(<CoffeeCup />);
      expect(screen.getByText(/Coffee break/i)).toBeInTheDocument();
    });

    it('shakes and plays sound on first click, and spills on 5th click', () => {
      const sloshSpy = vi.fn();
      const spillSpy = vi.fn();
      window.addEventListener('coffee-slosh', sloshSpy);
      window.addEventListener('coffee-spill', spillSpy);

      const { container } = render(<CoffeeCup />);
      const cupSvg = container.querySelector('svg[viewBox="0 0 80 80"]');
      const cupContainer = cupSvg.parentElement;

      // 1st click
      fireEvent.click(cupContainer);
      expect(soundSynth.playSlosh).toHaveBeenCalled();
      expect(sloshSpy).toHaveBeenCalled();

      // Next 3 clicks
      for (let i = 0; i < 3; i++) {
        fireEvent.click(cupContainer);
      }
      expect(soundSynth.playSplat).not.toHaveBeenCalled();

      // 5th click (Spill)
      fireEvent.click(cupContainer);
      expect(soundSynth.playSplat).toHaveBeenCalled();
      expect(spillSpy).toHaveBeenCalled();
      expect(screen.getByText(/Oops! Spilled/i)).toBeInTheDocument();

      // Reset click
      fireEvent.click(cupContainer);
      expect(soundSynth.playPop).toHaveBeenCalled();
      expect(
        screen.getByText(/Coffee break \(0\/5 clicks\)/i)
      ).toBeInTheDocument();

      window.removeEventListener('coffee-slosh', sloshSpy);
      window.removeEventListener('coffee-spill', spillSpy);
    });
  });

  describe('InkLeak Component', () => {
    it('listens to ink-leak-triggered event, transitions stages and shatters on click', async () => {
      vi.useFakeTimers();
      const { container } = render(<InkLeak />);

      // Let mount effects run
      await act(async () => {
        await vi.runAllTicks();
      });

      // Dispatch ink leak event
      const event = new CustomEvent('ink-leak-triggered', {
        detail: { x: 300, y: 150 },
      });
      fireEvent(window, event);

      // Droplet should fall and immediately convert to blot (since mock auto-fires onAnimationComplete)
      const eyes = container.querySelectorAll('circle[fill="var(--card-bg)"]');
      expect(eyes.length).toBe(2);
      expect(soundSynth.playSplat).toHaveBeenCalled();

      // Click the blot to scatter it
      const blotSvg = container.querySelector('svg[viewBox="0 0 110 110"]');
      fireEvent.click(blotSvg);
      expect(soundSynth.playPop).toHaveBeenCalled();

      // Advance fake timers by 1200ms to verify it goes back to idle stage
      await act(async () => {
        vi.advanceTimersByTime(1200);
        await vi.runAllTicks();
      });
      expect(
        container.querySelectorAll('circle[fill="var(--card-bg)"]').length
      ).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('PageCrumpler Component', () => {
    it('skips transition if disabled in settings', () => {
      const { settings } = usePortfolioSettings();
      settings.enableCrumpledPageTransition = false;
      const actionSpy = vi.fn();

      render(
        <MemoryRouter>
          <PageCrumpler />
        </MemoryRouter>
      );

      const event = new CustomEvent('page-crumple-transition', {
        detail: { action: actionSpy },
      });
      fireEvent(window, event);

      expect(actionSpy).toHaveBeenCalled();
      expect(soundSynth.playCrumple).not.toHaveBeenCalled();
    });

    it('plays sound and runs callback when event fires (settings enabled)', async () => {
      vi.useFakeTimers();
      const actionSpy = vi.fn();

      render(
        <MemoryRouter>
          <PageCrumpler />
        </MemoryRouter>
      );

      const event = new CustomEvent('page-crumple-transition', {
        detail: { action: actionSpy },
      });
      fireEvent(window, event);

      expect(soundSynth.playCrumple).toHaveBeenCalled();
      expect(actionSpy).toHaveBeenCalled();

      // Advance timer by 150ms to end animation
      await act(async () => {
        vi.advanceTimersByTime(150);
        await vi.runAllTicks();
      });
      vi.useRealTimers();
    });
  });

  describe('SketchyBug Component', () => {
    beforeAll(() => {
      vi.stubGlobal('requestAnimationFrame', (cb) => setTimeout(cb, 16));
      vi.stubGlobal('cancelAnimationFrame', (id) => clearTimeout(id));
    });

    afterAll(() => {
      vi.unstubAllGlobals();
    });

    it('spawns a bug, moves it, and squashes it on click', async () => {
      vi.useFakeTimers();
      const squashSpy = vi.fn();
      window.addEventListener('bug-squashed', squashSpy);

      const { container } = render(<SketchyBug />);

      // Let mount effects run
      await act(async () => {
        await vi.runAllTicks();
      });

      // Verify no bug is present initially
      expect(container.querySelector('svg')).toBeNull();

      // Advance timers by 12 seconds to spawn the bug
      await act(async () => {
        vi.advanceTimersByTime(12000);
        await vi.runAllTicks();
      });

      // Now the bug should be in the DOM
      const bugSvg = container.querySelector('svg[viewBox="0 0 30 30"]');
      expect(bugSvg).toBeInTheDocument();
      const bugElement = bugSvg.parentElement;

      // Advance timers to trigger requestAnimationFrame steps
      await act(async () => {
        vi.advanceTimersByTime(100);
        await vi.runAllTicks();
      });

      // Click the bug to squash it
      await act(async () => {
        fireEvent.click(bugElement);
        await vi.runAllTicks();
      });
      expect(soundSynth.playTap).toHaveBeenCalled();
      expect(squashSpy).toHaveBeenCalled();

      // Verify it changes to squashed state (splatFilter exists)
      const splatFilter = container.querySelector('#splatFilter');
      expect(splatFilter).toBeInTheDocument();

      // Advance timers by 1500ms to verify bug fades out and is removed
      await act(async () => {
        vi.advanceTimersByTime(1500);
        await vi.runAllTicks();
      });
      expect(container.querySelector('svg')).toBeNull();

      window.removeEventListener('bug-squashed', squashSpy);
      vi.useRealTimers();
    });
  });

  describe('PageTear Component', () => {
    it('renders flap initially, opens Tic-Tac-Toe, and plays a full game', async () => {
      vi.useFakeTimers();
      const startSpy = vi.fn();
      const winSpy = vi.fn();
      const drawSpy = vi.fn();
      window.addEventListener('ttt-start', startSpy);
      window.addEventListener('ttt-win-user', winSpy);
      window.addEventListener('ttt-draw', drawSpy);

      const { container } = render(<PageTear />);

      // Let mount effects run
      await act(async () => {
        await vi.runAllTicks();
      });

      // Find the corner flap
      const flap = container.querySelector('svg[viewBox="0 0 65 65"]');
      expect(flap).toBeInTheDocument();

      // Click flap to open Tic-Tac-Toe
      await act(async () => {
        fireEvent.click(flap.parentElement);
        await vi.runAllTicks();
      });
      expect(soundSynth.playTear).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();

      // Find grid cells (last 9 child divs in the 180px width grid container)
      const grid = container.querySelector('div[style*="width: 180px"]');
      const allDivs = grid.querySelectorAll('div');
      const cells = Array.from(allDivs).slice(-9);
      expect(cells.length).toBe(9);

      // Play moves where Doodly wins on diagonal [2, 4, 6]
      // 1. Click 0
      await act(async () => {
        fireEvent.click(cells[0]);
        await vi.runAllTicks();
      });

      // Let Doodly AI effect run and schedule timer
      await act(async () => {
        await vi.runAllTicks();
      });

      // Advance 600ms for Doodly move
      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTicks();
      });
      expect(cells[4]).toHaveTextContent('O');

      // 2. Click 1
      await act(async () => {
        fireEvent.click(cells[1]);
        await vi.runAllTicks();
      });

      // Let effect run
      await act(async () => {
        await vi.runAllTicks();
      });

      // Advance 600ms for Doodly move
      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTicks();
      });
      expect(cells[2]).toHaveTextContent('O');

      // 3. Click 3
      await act(async () => {
        fireEvent.click(cells[3]);
        await vi.runAllTicks();
      });

      const winDoodlySpy = vi.fn();
      window.addEventListener('ttt-win-doodly', winDoodlySpy);

      // Let effect run
      await act(async () => {
        await vi.runAllTicks();
      });

      // Advance 600ms for Doodly move
      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTicks();
      });
      expect(cells[6]).toHaveTextContent('O');
      expect(winDoodlySpy).toHaveBeenCalled();
      expect(screen.getByText(/Дудли выиграл/i)).toBeInTheDocument();

      // Click Reset
      const resetBtn = screen.getByRole('button', { name: /Сыграть ещё/i });
      await act(async () => {
        fireEvent.click(resetBtn);
        await vi.runAllTicks();
      });

      // Verify cells are reset
      expect(cells[0].textContent).toBe('');
      expect(cells[4].textContent).toBe('');

      window.removeEventListener('ttt-start', startSpy);
      window.removeEventListener('ttt-win-user', winSpy);
      window.removeEventListener('ttt-draw', drawSpy);
      window.removeEventListener('ttt-win-doodly', winDoodlySpy);
      vi.useRealTimers();
    });
  });

  describe('SvgIllustrations Component', () => {
    it('renders all SVG components without crashing', () => {
      const { container: c1 } = render(<DeveloperIllustration />);
      expect(c1.querySelector('svg')).toBeInTheDocument();

      const { container: c2 } = render(<TechIcon />);
      expect(c2.querySelector('svg')).toBeInTheDocument();

      const { container: c3 } = render(<ReactIcon />);
      expect(c3.querySelector('svg')).toBeInTheDocument();

      const { container: c4 } = render(<NodeIcon />);
      expect(c4.querySelector('svg')).toBeInTheDocument();

      const { container: c5 } = render(<PythonIcon />);
      expect(c5.querySelector('svg')).toBeInTheDocument();

      const { container: c6 } = render(<DatabaseIcon />);
      expect(c6.querySelector('svg')).toBeInTheDocument();

      const { container: c7 } = render(<DockerIcon />);
      expect(c7.querySelector('svg')).toBeInTheDocument();

      const { container: c8 } = render(<SqlIcon />);
      expect(c8.querySelector('svg')).toBeInTheDocument();

      const { container: c9 } = render(<RocketIcon />);
      expect(c9.querySelector('svg')).toBeInTheDocument();

      const { container: c10 } = render(<MailIcon />);
      expect(c10.querySelector('svg')).toBeInTheDocument();

      const { container: c11 } = render(<ProjectIcon />);
      expect(c11.querySelector('svg')).toBeInTheDocument();

      const { container: c12 } = render(<StarIcon />);
      expect(c12.querySelector('svg')).toBeInTheDocument();

      const { container: c13 } = render(<CodeIcon />);
      expect(c13.querySelector('svg')).toBeInTheDocument();

      const { container: c14 } = render(<BackgroundParticles />);
      expect(c14.querySelector('svg')).toBeInTheDocument();

      const { container: c15 } = render(<CheckIcon />);
      expect(c15.querySelector('svg')).toBeInTheDocument();

      const { container: c16 } = render(<LightningIcon />);
      expect(c16.querySelector('svg')).toBeInTheDocument();

      const { container: c17 } = render(<SketchLockIcon />);
      expect(c17.querySelector('svg')).toBeInTheDocument();

      const { container: c18 } = render(<SketchSunIcon />);
      expect(c18.querySelector('svg')).toBeInTheDocument();

      const { container: c19 } = render(<SketchMoonIcon />);
      expect(c19.querySelector('svg')).toBeInTheDocument();

      const { container: c20 } = render(<SketchSoundIcon />);
      expect(c20.querySelector('svg')).toBeInTheDocument();
    });
  });
});
