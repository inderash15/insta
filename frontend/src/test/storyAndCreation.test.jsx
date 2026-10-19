import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StoryTray from '../components/feed/StoryTray';
import CreateModal from '../components/modals/CreateModal';
import api from '../services/api';

// Mock Auth Context
const mockUser = {
  _id: 'user_123',
  id: 'user_123',
  username: 'inderash',
  avatarUrl: 'https://example.com/inderash.jpg'
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser })
}));

// Mock Socket Context
vi.mock('../context/SocketContext', () => ({
  useSocket: () => ({ socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() } })
}));

// Mock API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  },
  getMediaUrl: (url) => url
}));

describe('StoryTray & Isolated Creation Entry Points Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. StoryTray: Illuminates Your story and does NOT duplicate current user in tray', async () => {
    // API returns current user ("inderash") with isSelf: true, plus another user ("indhu")
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        tray: [
          {
            author: { _id: 'user_123', username: 'inderash', avatarUrl: 'https://example.com/inderash.jpg' },
            stories: [{ _id: 'story_1', mediaUrl: '/uploads/s1.jpg', audience: 'everyone' }],
            hasUnviewed: false,
            hasCloseFriends: false,
            isSelf: true
          },
          {
            author: { _id: 'user_456', username: 'indhu', avatarUrl: 'https://example.com/indhu.jpg' },
            stories: [{ _id: 'story_2', mediaUrl: '/uploads/s2.jpg', audience: 'everyone' }],
            hasUnviewed: true,
            hasCloseFriends: false,
            isSelf: false
          }
        ]
      }
    });

    const onOpenCreateStory = vi.fn();
    render(<StoryTray onOpenCreateStory={onOpenCreateStory} />);

    // Wait for API to resolve
    await waitFor(() => {
      expect(screen.getByText('Your story')).toBeInTheDocument();
      expect(screen.getByText('indhu')).toBeInTheDocument();
    });

    // Verify current user username "inderash" is NOT rendered as a separate bubble
    // because it was absorbed into "Your story"
    expect(screen.queryByText('inderash')).toBeNull();
  });

  it('2. CreateModal: When locked to story mode, shows only New Story flow without Post/Reel tabs', () => {
    render(
      <CreateModal
        isOpen={true}
        initialMode="story"
        lockMode={true}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    // Header has New Story
    expect(screen.getByText(/New Story/i)).toBeInTheDocument();
    expect(screen.getByText(/Stories disappear after 24 hours/i)).toBeInTheDocument();

    // Tab buttons must NOT be present
    expect(screen.queryByRole('button', { name: /Post/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Reel/i })).toBeNull();

    // Story-specific audience options must be present
    expect(screen.getByText('Everyone')).toBeInTheDocument();
    expect(screen.getByText('Close Friends')).toBeInTheDocument();

    // 24h expiration badge
    expect(screen.getByText(/Visible to your audience for 24 hours/i)).toBeInTheDocument();
  });

  it('3. CreateModal: When locked to reel mode, shows only Reel composer and audio track input', () => {
    render(
      <CreateModal
        isOpen={true}
        initialMode="reel"
        lockMode={true}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    expect(screen.getByText(/Create New Reel/i)).toBeInTheDocument();
    expect(screen.getByText(/Audio Track Name/i)).toBeInTheDocument();

    // Tab switcher must not be present
    expect(screen.queryByRole('button', { name: /Story/i })).toBeNull();
  });

  it('4. CreateModal: When locked to post mode, shows only Post composer', () => {
    render(
      <CreateModal
        isOpen={true}
        initialMode="post"
        lockMode={true}
        onClose={vi.fn()}
        onCreated={vi.fn()}
      />
    );

    expect(screen.getByText(/Create New Post/i)).toBeInTheDocument();
    expect(screen.getByText(/Caption & Hashtags/i)).toBeInTheDocument();
    expect(screen.queryByText(/Audio Track Name/i)).toBeNull();
    expect(screen.queryByText(/Close Friends/i)).toBeNull();
  });
});
