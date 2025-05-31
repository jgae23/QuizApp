// setupTests.js
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios', () => {
  const mockAxios = {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} }))
  };
  
  // Add default property that also has all these methods
  mockAxios.default = { ...mockAxios };
  
  return mockAxios;
});

// Mock CSS files
jest.mock('bootstrap/dist/css/bootstrap.min.css', () => ({}));
jest.mock('bootstrap-icons/font/bootstrap-icons.css', () => ({}));
