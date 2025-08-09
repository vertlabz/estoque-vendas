import { render, screen } from '@testing-library/react';
import LoginForm from '@/components/LoginForm';
import { AuthProvider } from '@/context/AuthContext';

jest.mock('next/router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('LoginForm', () => {
  it('renders heading', () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });
});
