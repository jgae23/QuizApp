// _tests__/QuizGenerator.js
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import QuizGenerator from '../../pages/QuizGenerator';
import React from 'react';

test('renders QuizGenerator and waits for category select', async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/generate/ai']}>
        <Routes>
          <Route path="/generate/:type" element={<QuizGenerator />} />
        </Routes>
      </MemoryRouter>
    );
  });

  expect(screen.getByText(/Ready to Challenge Yourself?/i)).toBeInTheDocument();
  // Add test to check for the new instruction text
  expect(screen.getByText(/Choose a topic, set your difficulty, and we'll generate questions just for you!/i)).toBeInTheDocument();
});
