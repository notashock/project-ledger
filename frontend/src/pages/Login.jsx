import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registerUser } from '../services/api';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isRegistering) {
        await registerUser(username, password);
        toast.success('Registration successful! Logging you in...');
        await login(username, password);
      } else {
        await login(username, password);
        toast.success('Logged in successfully!');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || (isRegistering ? 'Registration failed' : 'Invalid username or password');
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-6 selection:bg-primary selection:text-on-primary font-body-md">
      <div className="w-full max-w-md bg-surface-container-lowest border-2 border-[#000000] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col gap-6 rounded">
        <div className="text-center">
          <h1 className="text-headline-lg font-headline-lg font-bold text-primary tracking-tight">TrustLedger</h1>
          <p className="font-label-bold text-label-bold text-on-surface-variant mt-1 uppercase tracking-wider">Agri-Trader Pro</p>
        </div>

        <hr className="border-outline-variant" />

        <h2 className="font-headline-md text-headline-md text-on-surface font-bold text-center">
          {isRegistering ? 'Register Admin Account' : 'Login to your account'}
        </h2>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container border border-error font-label-bold text-sm text-center rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-label-bold text-on-surface">Username</label>
            <input
              required
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-bold text-label-bold text-on-surface">Password</label>
            <input
              required
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[48px] px-4 border border-outline focus:border-[#000000] focus:border-2 bg-surface outline-none transition-all rounded"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-container text-on-primary h-[48px] border-2 border-[#000000] font-label-bold hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none rounded"
          >
            {isLoading ? (isRegistering ? 'Registering...' : 'Logging in...') : (isRegistering ? 'Register Admin' : 'Login')}
          </button>
        </form>

        <div className="text-center mt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-primary font-label-bold hover:underline bg-transparent border-none cursor-pointer"
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
