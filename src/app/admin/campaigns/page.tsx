'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: string;
  discountType: string | null;
  discountValue: number | null;
  minPurchase: number | null;
  pointsMultiplier: number;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'DISCOUNT',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchase: '',
    pointsMultiplier: 1,
    isActive: true,
    usageLimit: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCampaign
        ? `/api/admin/campaigns/${editingCampaign.id}`
        : '/api/admin/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        discountValue: formData.discountValue
          ? parseFloat(formData.discountValue)
          : null,
        minPurchase: formData.minPurchase
          ? parseFloat(formData.minPurchase)
          : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(
          `Campaign ${editingCampaign ? 'updated' : 'created'} successfully`
        );
        fetchCampaigns();
        setIsCreateOpen(false);
        setEditingCampaign(null);
        resetForm();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to save campaign');
      }
    } catch (error) {
      console.error('Failed to save campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      discountType: campaign.discountType || 'PERCENTAGE',
      discountValue: campaign.discountValue?.toString() || '',
      minPurchase: campaign.minPurchase?.toString() || '',
      pointsMultiplier: campaign.pointsMultiplier,
      isActive: campaign.isActive,
      usageLimit: campaign.usageLimit?.toString() || '',
      startDate: campaign.startDate
        ? new Date(campaign.startDate).toISOString().slice(0, 16)
        : '',
      endDate: campaign.endDate
        ? new Date(campaign.endDate).toISOString().slice(0, 16)
        : '',
    });
    setIsCreateOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'DISCOUNT',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minPurchase: '',
      pointsMultiplier: 1,
      isActive: true,
      usageLimit: '',
      startDate: '',
      endDate: '',
    });
  };

  const getTypeDescription = (campaign: Campaign) => {
    switch (campaign.type) {
      case 'DISCOUNT':
        return `${campaign.discountType} ${campaign.discountValue}% off`;
      case 'BOGO':
        return 'Buy One Get One';
      case 'FREE_SHIPPING':
        return 'Free Shipping';
      case 'POINTS_MULTIPLIER':
        return `${campaign.pointsMultiplier}x Points`;
      default:
        return campaign.type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Promotional Campaigns</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCampaign(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Campaign Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISCOUNT">Discount</SelectItem>
                      <SelectItem value="BOGO">Buy One Get One</SelectItem>
                      <SelectItem value="FREE_SHIPPING">
                        Free Shipping
                      </SelectItem>
                      <SelectItem value="POINTS_MULTIPLIER">
                        Points Multiplier
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Special holiday discount for all customers!"
                  required
                />
              </div>

              {(formData.type === 'DISCOUNT' || formData.type === 'BOGO') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Select
                        value={formData.discountType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, discountType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                          <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">
                        {formData.discountType === 'PERCENTAGE'
                          ? 'Discount Percentage *'
                          : 'Discount Amount *'}
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        step={
                          formData.discountType === 'PERCENTAGE' ? '1' : '0.01'
                        }
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountValue: e.target.value,
                          })
                        }
                        placeholder={
                          formData.discountType === 'PERCENTAGE'
                            ? '20'
                            : '10.00'
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minPurchase">Minimum Purchase ($)</Label>
                    <Input
                      id="minPurchase"
                      type="number"
                      step="0.01"
                      value={formData.minPurchase}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPurchase: e.target.value,
                        })
                      }
                      placeholder="25.00"
                    />
                  </div>
                </>
              )}

              {formData.type === 'POINTS_MULTIPLIER' && (
                <div className="space-y-2">
                  <Label htmlFor="pointsMultiplier">Points Multiplier *</Label>
                  <Input
                    id="pointsMultiplier"
                    type="number"
                    min="1"
                    value={formData.pointsMultiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pointsMultiplier: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="2"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageCount">Current Usage</Label>
                  <Input
                    id="usageCount"
                    type="number"
                    value={editingCampaign?.usageCount || 0}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCampaign(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCampaign ? 'Update' : 'Create'} Campaign
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Campaigns
                </p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Megaphone className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns.filter((c) => c.isActive).length}
                </p>
              </div>
              <Megaphone className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Used</p>
                <p className="text-2xl font-bold text-blue-600">
                  {campaigns.reduce((sum, c) => sum + c.usageCount, 0)}
                </p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Usage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {campaigns.length > 0
                    ? Math.round(
                        campaigns.reduce((sum, c) => sum + c.usageCount, 0) /
                          campaigns.length
                      )
                    : 0}
                </p>
              </div>
              <Megaphone className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {campaign.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{campaign.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTypeDescription(campaign)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{campaign.usageCount} used</div>
                      {campaign.usageLimit && (
                        <div className="text-gray-500">
                          of {campaign.usageLimit}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        campaign.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {campaign.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {campaign.endDate
                      ? new Date(campaign.endDate).toLocaleDateString()
                      : 'No expiry'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(campaign)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
