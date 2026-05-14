import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../src/app/login/page';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../src/lib/api';

// Mock the next/navigation router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the AuthContext
jest.mock('../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the API
jest.mock('../src/lib/api', () => ({
  post: jest.fn(),
}));

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    render(<LoginPage />);
    
    // Check if title is present
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    
    // Check inputs
    expect(screen.getByPlaceholderText('ejemplo@correo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        accessToken: 'fake-token',
        refreshToken: 'fake-refresh-token',
      },
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { value: 'test@test.com' },
    });
    
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith();

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles login failure', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('ejemplo@correo.com'), {
      target: { value: 'wrong@test.com' },
    });
    
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpassword' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'wrong@test.com',
        password: 'wrongpassword',
      });
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
