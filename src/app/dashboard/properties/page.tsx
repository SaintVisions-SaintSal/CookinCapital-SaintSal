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
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Home,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Loader2,
  Plus,
  History,
} from 'lucide-react';

interface PropertyScore {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  purchase_price: number;
  overall_score: number;
  cash_flow_score: number;
  appreciation_score: number;
  risk_score: number;
  ai_analysis: {
    summary: string;
    strengths: string[];
    concerns: string[];
    recommendation: string;
  } | null;
  created_at: string;
}

const propertyTypes = [
  { value: 'single-family', label: 'Single Family' },
  { value: 'multi-family', label: 'Multi Family' },
  { value: 'condo', label: 'Condo/Townhouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyScore | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'single-family',
    purchasePrice: '',
    arv: '',
    repairCost: '',
    rentEstimate: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoring(true);

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          propertyType: formData.propertyType,
          purchasePrice: parseFloat(formData.purchasePrice),
          arv: formData.arv ? parseFloat(formData.arv) : undefined,
          repairCost: formData.repairCost ? parseFloat(formData.repairCost) : undefined,
          rentEstimate: formData.rentEstimate ? parseFloat(formData.rentEstimate) : undefined,
        }),
      });

      if (response.ok) {
        const newProperty = await response.json();
        setProperties((prev) => [newProperty, ...prev]);
        setSelectedProperty(newProperty);
        setShowForm(false);
        setFormData({
          address: '',
          city: '',
          state: '',
          zipCode: '',
          propertyType: 'single-family',
          purchasePrice: '',
          arv: '',
          repairCost: '',
          rentEstimate: '',
        });
      }
    } catch (error) {
      console.error('Failed to score property:', error);
    } finally {
      setScoring(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Scoring</h1>
          <p className="text-muted-foreground">
            AI-powered investment analysis for real estate
          </p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Score Property
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Property List / Form */}
        <div className="lg:col-span-1 space-y-4">
          {showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>New Property Score</CardTitle>
                <CardDescription>
                  Enter property details for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="CA"
                        maxLength={2}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Type</Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(v) => setFormData({ ...formData, propertyType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="250000"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="arv">ARV</Label>
                      <Input
                        id="arv"
                        type="number"
                        value={formData.arv}
                        onChange={(e) => setFormData({ ...formData, arv: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repairCost">Repairs</Label>
                      <Input
                        id="repairCost"
                        type="number"
                        value={formData.repairCost}
                        onChange={(e) => setFormData({ ...formData, repairCost: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rentEstimate">Rent</Label>
                      <Input
                        id="rentEstimate"
                        type="number"
                        value={formData.rentEstimate}
                        onChange={(e) => setFormData({ ...formData, rentEstimate: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="gold" className="flex-1" disabled={scoring}>
                      {scoring ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Scoring...
                        </>
                      ) : (
                        'Score Property'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : properties.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No properties scored yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {properties.map((property) => (
                      <button
                        key={property.id}
                        onClick={() => setSelectedProperty(property)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedProperty?.id === property.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium truncate">{property.address}</p>
                            <p className="text-sm text-muted-foreground">
                              {property.city}, {property.state}
                            </p>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(property.overall_score)}`}>
                            {property.overall_score}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Score Details */}
        <div className="lg:col-span-2">
          {selectedProperty ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedProperty.address}</CardTitle>
                      <CardDescription>
                        {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(selectedProperty.overall_score)}`}>
                        {selectedProperty.overall_score}
                      </div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Cash Flow</span>
                      </div>
                      <Progress
                        value={selectedProperty.cash_flow_score}
                        className={`h-2 [&>div]:${getScoreBg(selectedProperty.cash_flow_score)}`}
                      />
                      <p className="text-sm text-muted-foreground">
                        {selectedProperty.cash_flow_score}/100
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Appreciation</span>
                      </div>
                      <Progress
                        value={selectedProperty.appreciation_score}
                        className={`h-2 [&>div]:${getScoreBg(selectedProperty.appreciation_score)}`}
                      />
                      <p className="text-sm text-muted-foreground">
                        {selectedProperty.appreciation_score}/100
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Risk Score</span>
                      </div>
                      <Progress
                        value={100 - selectedProperty.risk_score}
                        className={`h-2 [&>div]:${getScoreBg(100 - selectedProperty.risk_score)}`}
                      />
                      <p className="text-sm text-muted-foreground">
                        {selectedProperty.risk_score}/100 risk
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Purchase Price:</strong> {formatCurrency(selectedProperty.purchase_price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Property Type:</strong> {selectedProperty.property_type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Scored:</strong> {formatDate(selectedProperty.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {selectedProperty.ai_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-muted-foreground">{selectedProperty.ai_analysis.summary}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                        <ul className="space-y-1">
                          {selectedProperty.ai_analysis.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 mt-1">+</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Concerns</h4>
                        <ul className="space-y-1">
                          {selectedProperty.ai_analysis.concerns.map((c, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-red-500 mt-1">-</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Recommendation</h4>
                      <p className="text-muted-foreground">{selectedProperty.ai_analysis.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Select a Property</h3>
                <p className="text-muted-foreground">
                  Choose a property from the list or score a new one
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
