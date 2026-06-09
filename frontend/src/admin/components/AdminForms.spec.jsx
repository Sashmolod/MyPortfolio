import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SkillForm from './SkillForm';
import ProjectForm from './ProjectForm';
import HeroForm from './HeroForm';
import SocialLinkForm from './SocialLinkForm';
import api from '../../api';

// Mock API calls
vi.mock('../../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock framer-motion to bypass animations
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('Admin Forms components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.toast = vi.fn();
  });

  describe('SkillForm', () => {
    it('renders Add Skill mode initially and handles validation', async () => {
      const mockSave = vi.fn();
      const mockCancel = vi.fn();

      render(<SkillForm onSaveData={mockSave} onCancel={mockCancel} />);

      expect(screen.getByText('Add Skill')).toBeInTheDocument();

      // Submit without name -> validation error
      const saveBtn = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveBtn);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(mockSave).not.toHaveBeenCalled();

      // Fill name and save
      const nameInput = screen.getByPlaceholderText('Name');
      fireEvent.change(nameInput, { target: { value: 'JavaScript' } });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({
          name: 'JavaScript',
          icon: '',
          description: '',
          level: 50,
          sortOrder: 0,
        });
      });
    });

    it('renders Edit Skill mode when item is provided', async () => {
      const mockSave = vi.fn();
      const mockCancel = vi.fn();
      const item = { name: 'React', icon: 'react', description: 'Frontend', level: 90, sortOrder: 2 };

      render(<SkillForm item={item} onSaveData={mockSave} onCancel={mockCancel} />);

      expect(screen.getByText('Edit Skill')).toBeInTheDocument();
      expect(screen.getByDisplayValue('React')).toBeInTheDocument();
      expect(screen.getByDisplayValue('react')).toBeInTheDocument();
      expect(screen.getByDisplayValue('90')).toBeInTheDocument();

      // Click Cancel
      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelBtn);
      expect(mockCancel).toHaveBeenCalled();
    });
  });

  describe('ProjectForm', () => {
    it('renders and saves project details with validation checks', async () => {
      const mockSave = vi.fn();
      render(<ProjectForm onSaveData={mockSave} onCancel={vi.fn()} />);

      expect(screen.getByText('Add Project')).toBeInTheDocument();

      const saveBtn = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveBtn);
      expect(screen.getByText('Title is required')).toBeInTheDocument();

      const titleInput = screen.getByPlaceholderText('Title');
      fireEvent.change(titleInput, { target: { value: 'My Portfolio' } });

      fireEvent.click(saveBtn);
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({
          title: 'My Portfolio',
          description: '',
          image: '',
          link: '',
          technologies: '',
          sortOrder: 0,
        });
      });
    });

    it('handles image file uploads and updates URL', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { url: '/uploads/my-proj.png' } });
      const { container } = render(<ProjectForm onSaveData={vi.fn()} onCancel={vi.fn()} />);

      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      const fileInput = container.querySelector('input[type="file"]');
      
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
        expect(window.toast).toHaveBeenCalledWith('Image uploaded successfully', 'success');
      });

      expect(screen.getByDisplayValue('/uploads/my-proj.png')).toBeInTheDocument();

      // Remove image
      const removeBtn = screen.getByRole('button', { name: 'Remove' });
      fireEvent.click(removeBtn);
      expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
    });
  });

  describe('HeroForm', () => {
    it('renders and saves hero details with toast warnings', async () => {
      const mockSave = vi.fn();
      const heroData = { id: 1, name: 'Alice', title: 'Designer', bio: 'Bio details', avatar: '/test-avatar.jpg' };

      render(<HeroForm heroData={heroData} onSaveData={mockSave} onCancel={vi.fn()} />);

      expect(screen.getByText('Edit Hero Section')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();

      // Click save
      const saveBtn = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({
          name: 'Alice',
          title: 'Designer',
          bio: 'Bio details',
          avatar: '/test-avatar.jpg',
        });
      });
    });

    it('handles avatar upload', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { url: '/uploads/avatar.jpg' } });
      const { container } = render(<HeroForm onSaveData={vi.fn()} onCancel={vi.fn()} />);

      const file = new File(['dummy content'], 'avatar.jpg', { type: 'image/jpeg' });
      const fileInput = container.querySelector('input[type="file"]');

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
        expect(window.toast).toHaveBeenCalledWith('Avatar uploaded successfully', 'success');
      });
      expect(screen.getByDisplayValue('/uploads/avatar.jpg')).toBeInTheDocument();
    });

    it('attempts to trigger sketch conversion', async () => {
      // Mock Image class to automatically trigger onload in jsdom
      const originalImage = global.Image;
      global.Image = class {
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      };

      // Mock globally fetch & canvas draw
      const mockBlob = new Blob(['dummy blob'], { type: 'image/png' });
      global.fetch = vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      // Mock canvas toDataURL
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = (tagName) => {
        if (tagName === 'canvas') {
          return {
            getContext: () => ({
              drawImage: vi.fn(),
              getImageData: () => ({ data: new Uint8ClampedArray(400) }),
              putImageData: vi.fn(),
            }),
            toDataURL: () => 'data:image/png;base64,mock',
            width: 100,
            height: 100,
          };
        }
        return originalCreateElement(tagName);
      };

      // Mock API post for sketch upload
      vi.mocked(api.post).mockResolvedValueOnce({ data: { url: '/uploads/sketch.png' } });

      const heroData = { id: 1, name: 'Alice', title: 'Designer', bio: 'Bio', avatar: '/test-avatar.jpg' };
      render(<HeroForm heroData={heroData} onSaveData={vi.fn()} onCancel={vi.fn()} />);

      const sketchBtn = screen.getByText('✨ Эскиз карандашом');
      fireEvent.click(sketchBtn);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
        expect(window.toast).toHaveBeenCalledWith('Avatar converted to sketch successfully', 'success');
      });

      expect(screen.getByDisplayValue('/uploads/sketch.png')).toBeInTheDocument();
      document.createElement = originalCreateElement;
      global.Image = originalImage;
    });
  });

  describe('SocialLinkForm', () => {
    it('validates required platform and URL, then saves correctly', async () => {
      const mockSave = vi.fn();
      render(<SocialLinkForm onSaveData={mockSave} onCancel={vi.fn()} />);

      const saveBtn = screen.getByRole('button', { name: 'Save' });
      fireEvent.click(saveBtn);

      expect(screen.getByText('Platform is required')).toBeInTheDocument();
      expect(screen.getByText('URL is required')).toBeInTheDocument();

      const platformInput = screen.getByPlaceholderText('Platform (e.g. GitHub, Reddit)');
      const urlInput = screen.getByPlaceholderText('URL (e.g. https://github.com/...)');

      fireEvent.change(platformInput, { target: { value: 'GitHub' } });
      fireEvent.change(urlInput, { target: { value: 'https://github.com/alice' } });

      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({
          platform: 'GitHub',
          url: 'https://github.com/alice',
          sortOrder: 0,
        });
      });
    });
  });
});
