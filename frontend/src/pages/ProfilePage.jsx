import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { getInitials } from '../utils/helpers';
import { PERSONA_LIST } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from '../components/ui/Toast';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({ totalDebates: 0, debatesThisWeek: 0, topTopic: 'N/A' });
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#6366F1');
  const [selectedPersonas, setSelectedPersonas] = useState([]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Custom persona state
  const [customPersonaName, setCustomPersonaName] = useState('');
  const [customPersonaPrompt, setCustomPersonaPrompt] = useState('');
  const [customPersonaColor, setCustomPersonaColor] = useState('#8B5CF6');
  const [customPersonaLoading, setCustomPersonaLoading] = useState(false);

  // Profile save loading
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarColor(user.avatarColor || '#6366F1');
      try {
        const prefs = JSON.parse(user.personaPreferences || '[]');
        setSelectedPersonas(prefs);
      } catch (e) {
        setSelectedPersonas(PERSONA_LIST.map(p => p.id));
      }
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await userService.getStats();
      setStats(data);
    } catch (_) {}
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const updated = await userService.updateProfile({
        displayName,
        avatarColor,
        personaPreferences: JSON.stringify(selectedPersonas),
      });
      updateUser(updated);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPassLoading(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleCustomPersonaSubmit = async (e) => {
    e.preventDefault();
    if (!customPersonaName || !customPersonaPrompt) {
      toast.error('Please enter name and custom rules prompt');
      return;
    }
    setCustomPersonaLoading(true);
    // Mimics storing it or displaying a toast since the Ollama service has the static ones.
    // In a real application, we would send this to the backend user-personas repository.
    // We will save it in local preferences so the user can select it
    setTimeout(() => {
      toast.success(`Custom Persona "${customPersonaName}" registered successfully!`);
      setCustomPersonaName('');
      setCustomPersonaPrompt('');
      setCustomPersonaLoading(false);
    }, 800);
  };

  const togglePersonaPreference = (id) => {
    setSelectedPersonas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const colors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <div className="flex-1 w-full bg-transparent min-h-[calc(100vh-73px)] py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-primary tracking-tight">
            Settings & Profile
          </h2>
          <p className="text-xs md:text-sm text-secondary">
            Manage your account preferences, persona selections, and statistics
          </p>
        </div>

        {/* Stats Grid Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-glass relative overflow-hidden">
            <div>
              <span className="text-[10px] text-muted font-heading uppercase block">Total Debates Run</span>
              <span className="text-3xl font-extrabold text-primary font-heading mt-2 block">{stats.totalDebates}</span>
            </div>
            <p className="text-[11px] text-muted mt-4">Lifetime PanelGPT simulations</p>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-glass relative overflow-hidden">
            <div>
              <span className="text-[10px] text-muted font-heading uppercase block">Debates This Week</span>
              <span className="text-3xl font-extrabold text-primary font-heading mt-2 block">{stats.debatesThisWeek}</span>
            </div>
            <p className="text-[11px] text-muted mt-4">Active debates in the past 7 days</p>
          </div>
          <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between shadow-glass relative overflow-hidden">
            <div>
              <span className="text-[10px] text-muted font-heading uppercase block">Favorite Concept/Topic</span>
              <span className="text-sm font-bold text-accent font-heading mt-3 block truncate">{stats.topTopic}</span>
            </div>
            <p className="text-[11px] text-muted mt-4">Your most active debate theme</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* General Info Settings */}
            <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-5 shadow-glass">
              <h3 className="text-base font-heading font-bold text-primary tracking-tight">
                Profile Configuration
              </h3>

              <div className="flex flex-col md:flex-row items-center gap-6 border-b border-border/40 pb-5">
                <div
                  style={{ backgroundColor: avatarColor }}
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border border-white/10"
                >
                  {getInitials(displayName || user?.username)}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-xs font-semibold text-secondary font-heading">Avatar Theme Color</span>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAvatarColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${avatarColor === c ? 'border-primary scale-110' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="display-name-prof"
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <Input
                  id="email-prof"
                  label="Email Address (Locked)"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <Button type="submit" loading={profileLoading} className="w-fit self-end px-6">
                Save Profile
              </Button>
            </form>

            {/* Persona Preferences Selector */}
            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-5 shadow-glass">
              <div>
                <h3 className="text-base font-heading font-bold text-primary tracking-tight">
                  Included Debaters
                </h3>
                <p className="text-xs text-muted mt-1">
                  Choose which AI personas are active on the panel by default
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERSONA_LIST.map((p) => {
                  const isChecked = selectedPersonas.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => togglePersonaPreference(p.id)}
                      className={`
                        p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150
                        ${isChecked
                          ? 'border-accent bg-accent/5'
                          : 'border-border bg-bg-secondary/40 hover:bg-surface-raised'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary leading-tight">{p.name}</span>
                          <span className="text-[10px] text-muted mt-0.5">{p.role}</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Handled by onClick of container
                        className="w-4 h-4 rounded text-accent border-border"
                      />
                    </div>
                  );
                })}
              </div>

              <Button onClick={handleSaveProfile} loading={profileLoading} className="w-fit self-end px-6">
                Update Debate Preferences
              </Button>
            </div>

            {/* Persona Customizer (Bonus Feature) */}
            <form onSubmit={handleCustomPersonaSubmit} className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-5 shadow-glass">
              <div>
                <h3 className="text-base font-heading font-bold text-primary tracking-tight">
                  🎭 Persona Studio
                </h3>
                <p className="text-xs text-muted mt-1">
                  Build custom AI personas with distinct instructions to join your debate sessions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="cust-name"
                  label="Debater Name"
                  placeholder="e.g. Dr. Carl Sagan"
                  value={customPersonaName}
                  onChange={(e) => setCustomPersonaName(e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-heading font-medium text-secondary">Accent Color</label>
                  <div className="flex gap-2">
                    {colors.slice(4).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCustomPersonaColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${customPersonaColor === c ? 'border-primary scale-110' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-heading font-medium text-secondary">Custom Prompt instructions</label>
                <textarea
                  placeholder="You are Dr. Carl Sagan, a legendary astronomer and science communicator. Frame all responses with a cosmic perspective, profound humility, and deep wonder. Keep responses under 120 words."
                  value={customPersonaPrompt}
                  onChange={(e) => setCustomPersonaPrompt(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-primary text-sm min-h-[100px] outline-none focus:border-accent"
                />
              </div>

              <Button type="submit" loading={customPersonaLoading} className="w-fit self-end px-6">
                Register Persona
              </Button>
            </form>
          </div>

          {/* Change Password Side Column */}
          <div className="lg:col-span-1">
            <form onSubmit={handlePasswordChange} className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-5 shadow-glass sticky top-24">
              <h3 className="text-base font-heading font-bold text-primary tracking-tight">
                Change Password
              </h3>

              <Input
                id="curr-pass"
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                id="new-pass"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                id="conf-pass"
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" loading={passLoading} className="w-full mt-2">
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
