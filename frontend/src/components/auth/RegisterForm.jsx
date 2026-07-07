import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword, validateUsername } from '../../utils/helpers';
import Input from '../ui/Input';
import Button from '../ui/Button';

export const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const tempErrors = {};
    if (!username) {
      tempErrors.username = 'Username is required';
    } else if (!validateUsername(username)) {
      tempErrors.username = 'Username must be 3-50 alphanumeric characters or underscores';
    }

    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      tempErrors.email = 'Invalid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      tempErrors.password = 'Password must be at least 8 characters and contain at least one number';
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        username,
        email,
        password,
        displayName: displayName || username,
      });
      navigate('/debate');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Email or username might be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl glass shadow-glass relative overflow-hidden z-10 animate-debate-appear">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold font-heading text-primary tracking-tight">
          Create Account
        </h2>
        <p className="text-sm text-secondary mt-2">
          Join PanelGPT and participate in deep discussions
        </p>
      </div>

      {apiError && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="username-reg"
          label="Username"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          required
        />

        <Input
          id="email-reg"
          label="Email Address"
          placeholder="name@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        <Input
          id="display-reg"
          label="Display Name (Optional)"
          placeholder="John Doe"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
        />

        <Input
          id="password-reg"
          label="Password"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />

        <Input
          id="confirm-reg"
          label="Confirm Password"
          placeholder="••••••••"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" loading={loading} className="w-full mt-2 py-3">
          Sign Up
        </Button>
      </form>

      <p className="text-center text-sm text-secondary mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
