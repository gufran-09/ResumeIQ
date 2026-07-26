'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, UserPlus, Edit, Trash2, KeyRound, Shield, X, Mail, Lock, Loader2
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { api } from '@/services/api';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, DEPARTMENTS } from '@/constants';
import type { User, UserRole, Department } from '@/types';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  evaluator: 'bg-info/10 text-info border-info/20',
  hod: 'bg-success/10 text-success border-success/20',
  ADMIN: 'bg-primary/10 text-primary border-primary/20',
  EVALUATOR: 'bg-info/10 text-info border-info/20',
  HOD: 'bg-success/10 text-success border-success/20',
};

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; role: UserRole; department: Department }>({ name: '', email: '', role: 'evaluator', department: 'Computer Science' });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  });

  const users = usersData || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setShowCreate(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setShowCreate(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setDeleteUser(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete user'),
  });

  const openCreate = () => {
    setForm({ name: '', email: '', role: 'evaluator', department: 'Computer Science' });
    setEditingUser(null);
    setShowCreate(true);
  };

  const openEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, role: user.role, department: user.department });
    setEditingUser(user);
    setShowCreate(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = () => {
    if (deleteUser) {
      deleteMutation.mutate(deleteUser.id);
    }
  };

  const handleResetPassword = () => {
    if (resetUser) {
      toast.success('Password reset link sent', { description: `Reset instructions sent to ${resetUser.email}` });
      setResetUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage system users, roles, and permissions."
        icon={Users}
        actions={
          <Button onClick={openCreate}>
            <UserPlus className="mr-1.5 h-4 w-4" /> Add User
          </Button>
        }
      />

      {/* Role Legend */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
          <Card key={role}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2"><Shield className="h-4 w-4 text-primary" /></div>
              <div>
                <Badge className={ROLE_STYLES[role] || ROLE_STYLES.evaluator} variant="outline">{ROLE_LABELS[role]}</Badge>
                <p className="mt-1 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: any, i: number) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{getInitials(u.name)}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={ROLE_STYLES[u.role] || ROLE_STYLES.evaluator} variant="outline">{ROLE_LABELS[u.role as UserRole] || u.role}</Badge></TableCell>
                  <TableCell className="text-sm">{u.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}>
                      {u.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)} aria-label="Edit"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setResetUser(u)} aria-label="Reset password"><KeyRound className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteUser(u)} aria-label="Delete" className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information and role.' : 'Add a new user and assign their role.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="john@company.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select value={form.role} onValueChange={(v) => setForm((prev) => ({ ...prev, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Department</label>
              <Select value={form.department} onValueChange={(v) => setForm((prev) => ({ ...prev, department: v as Department }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingUser ? 'Save Changes' : 'Create User')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteUser}
        onOpenChange={(v) => !v && setDeleteUser(null)}
        title="Delete user?"
        description={`Are you sure you want to delete ${deleteUser?.name}? This action cannot be undone.`}
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        destructive
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!resetUser}
        onOpenChange={(v) => !v && setResetUser(null)}
        title="Reset password?"
        description={`A password reset link will be sent to ${resetUser?.email}.`}
        confirmLabel="Send Reset Link"
        onConfirm={handleResetPassword}
      />
    </div>
  );
}
