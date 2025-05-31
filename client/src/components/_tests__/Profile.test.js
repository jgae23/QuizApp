global.MutationObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    disconnect() {}
    observe() {}
};

import { render, screen, waitFor } from '@testing-library/react';
import Profile from '../../pages/Profile';
import React from 'react';

// Mock fetch calls
global.fetch = jest.fn();

test('renders Profile and displays user info and stats', async () => {
  // Mock the fetch for user info
  const mockUserInfo = {
    username: 'John Doe',
    email: 'john@example.com',
    joined: '2021-05-01T12:00:00Z',
  };
  
  const mockUserStats = [
    { score: 80, totalQuestions: 10 },
    { score: 90, totalQuestions: 10 },
    { score: 85, totalQuestions: 10 },
  ];

  // Mock the fetch responses
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve(mockUserInfo),
  });
  
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve(mockUserStats),
  });

  render(<Profile />);

  // Check for loading state, like if user name is not available yet
  //expect(screen.getByText(/Loading.../i)).toBeInTheDocument(); // You can add a loading state to your component for testing
  
  // Wait for the profile data to load
  await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());
  await waitFor(() => expect(screen.getByText(/john@example.com/i)).toBeInTheDocument());

  // Check if the stats are displayed correctly
  //expect(headings.find(h => h.textContent.includes('3'))).toBeInTheDocument();  // Quizzes Completed // Quizzes Completed
  expect(screen.getByText(/Questions/i)).toBeInTheDocument(); // Avg Score
  //expect(screen.getByText(/30/i)).toBeInTheDocument(); // Questions Answered
  
  // Check if the profile picture is rendered
  expect(screen.getByAltText(/Profile/i)).toBeInTheDocument();
});

