'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Settings, Moon, Sun, User, Lock, Bell, Globe, Palette, Eye, EyeOff, Check,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { ROLE_LABELS } from '@/constants';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [prefs, setPrefs] = useState({ emailNotifications: true, pushNotifications: false, weeklyReport: true, autoRefresh: true });

  useState(() => setMounted(true));

  const saveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const savePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('All fields are required');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const savePrefs = () => {
    toast.success('Preferences saved');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account, theme, and application preferences." icon={Settings} />

      <Tabs defaultValue="appearance">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="appearance"><Palette className="mr-1.5 h-4 w-4" />Appearance</TabsTrigger>
          <TabsTrigger value="profile"><User className="mr-1.5 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="password"><Lock className="mr-1.5 h-4 w-4" />Password</TabsTrigger>
          <TabsTrigger value="preferences"><Bell className="mr-1.5 h-4 w-4" />Preferences</TabsTrigger>
        </TabsList>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle className="text-base">Theme & Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium">Theme Mode</p>
                <p className="text-xs text-muted-foreground">Choose between light and dark mode.</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="rounded-lg bg-white border p-2"><Sun className="h-5 w-5 text-amber-500" /></div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Light</p>
                      <p className="text-xs text-muted-foreground">Default theme</p>
                    </div>
                    {theme === 'light' && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="rounded-lg bg-slate-900 p-2"><Moon className="h-5 w-5 text-blue-400" /></div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Dark</p>
                      <p className="text-xs text-muted-foreground">Low-light theme</p>
                    </div>
                    {theme === 'dark' && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">System Theme</p>
                  <p className="text-xs text-muted-foreground">Automatically match system appearance.</p>
                </div>
                <Switch checked={theme === 'system'} onCheckedChange={(v) => setTheme(v ? 'system' : 'light')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {user ? getInitials(user.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user ? ROLE_LABELS[user.role] : ''}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input value={profile.name} onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" value={profile.email} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Role</label>
                  <Input value={user ? ROLE_LABELS[user.role] : ''} disabled />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Department</label>
                  <Input value={user?.department ?? ''} disabled />
                </div>
              </div>
              <Button onClick={saveProfile}><Check className="mr-1.5 h-4 w-4" />Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password */}
        <TabsContent value="password">
          <Card className="max-w-lg">
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type={showPassword ? 'text' : 'password'} value={passwords.current} onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))} className="px-9" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New Password</label>
                <Input type={showPassword ? 'text' : 'password'} value={passwords.new} onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))} className="px-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input type={showPassword ? 'text' : 'password'} value={passwords.confirm} onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))} className="px-9" />
              </div>
              <Button onClick={savePassword}><Check className="mr-1.5 h-4 w-4" />Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader><CardTitle className="text-base">Application Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email alerts for new uploads and status changes.' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get in-app push notifications for real-time updates.' },
                { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive a weekly summary report of shortlisting activity.' },
                { key: 'autoRefresh', label: 'Auto-Refresh Dashboard', desc: 'Automatically refresh dashboard data every 30 seconds.' },
              ].map((item, i) => (
                <div key={item.key}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={prefs[item.key as keyof typeof prefs]}
                      onCheckedChange={(v) => setPrefs((prev) => ({ ...prev, [item.key]: v }))}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Button onClick={savePrefs}><Check className="mr-1.5 h-4 w-4" />Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
