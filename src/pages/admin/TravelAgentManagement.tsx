import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { TravelAgent } from '@/types';
import { Plus, Pencil, Building2, Users, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function TravelAgentManagement() {
  const { travelAgents, addTravelAgent, updateTravelAgent, getUsersByAgent } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<TravelAgent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    quotaAllocated: 50,
    isActive: true,
  });

  const filteredAgents = travelAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (agent?: TravelAgent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        quotaAllocated: agent.quotaAllocated,
        isActive: agent.isActive,
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: '',
        quotaAllocated: 50,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAgent) {
      updateTravelAgent(editingAgent.id, formData);
    } else {
      addTravelAgent(formData);
    }
    
    setIsDialogOpen(false);
    setEditingAgent(null);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Travel Agent Management"
        description="Manage travel agents and their quota allocations"
      >
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Travel Agent
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{travelAgents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Building2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{travelAgents.filter(a => a.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/50">
                <Users className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Quota Allocated</p>
                <p className="text-2xl font-bold">
                  {travelAgents.reduce((sum, a) => sum + a.quotaAllocated, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle>All Travel Agents</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Quota Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No travel agents found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => {
                    const users = getUsersByAgent(agent.id);
                    const quotaPercent = (agent.quotaUsed / agent.quotaAllocated) * 100;
                    return (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Building2 className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{agent.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{users.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{agent.quotaUsed} / {agent.quotaAllocated}</span>
                              <span>{Math.round(quotaPercent)}%</span>
                            </div>
                            <Progress value={quotaPercent} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agent.isActive ? 'default' : 'secondary'}>
                            {agent.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {format(new Date(agent.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(agent)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? 'Edit Travel Agent' : 'Add New Travel Agent'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Garuda Travel"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quota">Quota Allocation</Label>
              <Input
                id="quota"
                type="number"
                min={1}
                value={formData.quotaAllocated}
                onChange={(e) => setFormData({ ...formData, quotaAllocated: parseInt(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of promo transactions this agent can process
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAgent ? 'Save Changes' : 'Add Agent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
