import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  UserPlus,
  Edit,
  Shield,
  Building2,
} from 'lucide-react';

export default function UserManagement() {
  const { user: currentUser, isAdmin, isTravelAgentAdmin } = useAuth();
  const { users, travelAgents, addUser, updateUser, getUsersByAgent } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'travel_agent_user' as UserRole,
    travelAgentId: '',
    isActive: true,
  });

  // Filter users based on role
  const filteredUsers = isAdmin 
    ? users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getUsersByAgent(currentUser?.travelAgentId || '').filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'administrator': return 'default';
      case 'travel_agent_admin': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'administrator': return 'Administrator';
      case 'travel_agent_admin': return 'Agent Admin';
      case 'travel_agent_user': return 'Sales Staff';
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      email: '',
      role: 'travel_agent_user',
      travelAgentId: isTravelAgentAdmin ? currentUser?.travelAgentId || '' : '',
      isActive: true,
    });
    setShowAddDialog(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      travelAgentId: user.travelAgentId || '',
      isActive: user.isActive,
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const agent = travelAgents.find(a => a.id === formData.travelAgentId);

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        travelAgentId: formData.travelAgentId || null,
        travelAgentName: agent?.name || null,
        isActive: formData.isActive,
      });
      toast.success('User updated successfully');
      setEditingUser(null);
    } else {
      addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        travelAgentId: formData.travelAgentId || null,
        travelAgentName: agent?.name || null,
        isActive: formData.isActive,
      });
      toast.success('User created successfully');
      setShowAddDialog(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="User Management"
        description="Manage users and their access"
        actions={
          <Button onClick={handleOpenAddDialog}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        }
      />

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{user.travelAgentName || 'System'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenEditDialog(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden lg:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Travel Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.travelAgentName || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenEditDialog(user)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={showAddDialog || !!editingUser} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingUser(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: UserRole) => setFormData(f => ({ ...f, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="travel_agent_admin">Travel Agent Admin</SelectItem>
                    <SelectItem value="travel_agent_user">Sales Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(isAdmin || isTravelAgentAdmin) && formData.role !== 'administrator' && (
              <div className="space-y-2">
                <Label htmlFor="travelAgent">Travel Agent</Label>
                <Select 
                  value={formData.travelAgentId} 
                  onValueChange={(value) => setFormData(f => ({ ...f, travelAgentId: value }))}
                  disabled={isTravelAgentAdmin}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {travelAgents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(f => ({ ...f, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddDialog(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
