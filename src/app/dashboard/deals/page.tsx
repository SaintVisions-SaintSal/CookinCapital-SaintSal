'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Deal, DealStatus } from '@/types';
import {
  Briefcase,
  Plus,
  Loader2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

const dealStatuses: { value: DealStatus; label: string; color: string }[] = [
  { value: 'lead', label: 'Lead', color: 'bg-gray-500' },
  { value: 'application', label: 'Application', color: 'bg-blue-500' },
  { value: 'processing', label: 'Processing', color: 'bg-yellow-500' },
  { value: 'underwriting', label: 'Underwriting', color: 'bg-orange-500' },
  { value: 'approved', label: 'Approved', color: 'bg-green-500' },
  { value: 'funded', label: 'Funded', color: 'bg-emerald-500' },
  { value: 'closed', label: 'Closed', color: 'bg-purple-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
];

const dealTypes = [
  { value: 'purchase', label: 'Purchase' },
  { value: 'refinance', label: 'Refinance' },
  { value: 'construction', label: 'Construction' },
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [formData, setFormData] = useState({
    propertyAddress: '',
    dealType: 'purchase' as 'purchase' | 'refinance' | 'construction',
    loanAmount: '',
    borrowerName: '',
    borrowerEmail: '',
    borrowerPhone: '',
    notes: '',
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyAddress: formData.propertyAddress,
          dealType: formData.dealType,
          loanAmount: parseFloat(formData.loanAmount),
          borrowerName: formData.borrowerName,
          borrowerEmail: formData.borrowerEmail,
          borrowerPhone: formData.borrowerPhone || null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        const newDeal = await response.json();
        setDeals((prev) => [newDeal, ...prev]);
        setShowForm(false);
        setFormData({
          propertyAddress: '',
          dealType: 'purchase',
          loanAmount: '',
          borrowerName: '',
          borrowerEmail: '',
          borrowerPhone: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to create deal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateDealStatus = async (dealId: string, status: DealStatus) => {
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, status } : d))
        );
        if (selectedDeal?.id === dealId) {
          setSelectedDeal({ ...selectedDeal, status });
        }
      }
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  };

  const filteredDeals = activeTab === 'all'
    ? deals
    : deals.filter((d) => d.status === activeTab);

  const getStatusColor = (status: DealStatus) => {
    return dealStatuses.find((s) => s.value === status)?.color || 'bg-gray-500';
  };

  const pipelineStats = dealStatuses.map((status) => ({
    ...status,
    count: deals.filter((d) => d.status === status.value).length,
    volume: deals
      .filter((d) => d.status === status.value)
      .reduce((sum, d) => sum + d.loan_amount, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Pipeline</h1>
          <p className="text-muted-foreground">
            Manage your lending deals and track progress
          </p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Deal
        </Button>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {pipelineStats.map((stat) => (
          <Card
            key={stat.value}
            className={`cursor-pointer transition-all ${
              activeTab === stat.value ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveTab(stat.value)}
          >
            <CardContent className="p-3 text-center">
              <div className={`h-2 w-2 rounded-full ${stat.color} mx-auto mb-2`} />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold">{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Deal</CardTitle>
            <CardDescription>Add a new deal to your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input
                  id="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                  placeholder="123 Main St, City, ST 12345"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="dealType">Deal Type</Label>
                  <Select
                    value={formData.dealType}
                    onValueChange={(v) =>
                      setFormData({ ...formData, dealType: v as 'purchase' | 'refinance' | 'construction' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dealTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                    placeholder="250000"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="borrowerName">Borrower Name</Label>
                <Input
                  id="borrowerName"
                  value={formData.borrowerName}
                  onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="borrowerEmail">Borrower Email</Label>
                <Input
                  id="borrowerEmail"
                  type="email"
                  value={formData.borrowerEmail}
                  onChange={(e) => setFormData({ ...formData, borrowerEmail: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="borrowerPhone">Borrower Phone (Optional)</Label>
                <Input
                  id="borrowerPhone"
                  type="tel"
                  value={formData.borrowerPhone}
                  onChange={(e) => setFormData({ ...formData, borrowerPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Deal'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deals List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {activeTab === 'all' ? 'All Deals' : dealStatuses.find((s) => s.value === activeTab)?.label}
                </CardTitle>
                {activeTab !== 'all' && (
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('all')}>
                    View All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredDeals.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No deals found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDeals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedDeal?.id === deal.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(deal.status)}`} />
                          <span className="font-medium">{deal.borrower_name}</span>
                        </div>
                        <span className="font-bold">{formatCurrency(deal.loan_amount)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {deal.property_address}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{deal.deal_type}</span>
                        <span>{formatDate(deal.created_at)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deal Details */}
        <div>
          {selectedDeal ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Borrower</p>
                  <p className="font-medium">{selectedDeal.borrower_name}</p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedDeal.borrower_email}`} className="text-primary hover:underline">
                    {selectedDeal.borrower_email}
                  </a>
                </div>

                {selectedDeal.borrower_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedDeal.borrower_phone}`} className="text-primary hover:underline">
                      {selectedDeal.borrower_phone}
                    </a>
                  </div>
                )}

                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{selectedDeal.property_address}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-lg">{formatCurrency(selectedDeal.loan_amount)}</span>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <Select
                    value={selectedDeal.status}
                    onValueChange={(v) => updateDealStatus(selectedDeal.id, v as DealStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dealStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${status.color}`} />
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDeal.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{selectedDeal.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t text-xs text-muted-foreground">
                  <p>Created: {formatDate(selectedDeal.created_at)}</p>
                  <p>Updated: {formatDate(selectedDeal.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a deal to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
