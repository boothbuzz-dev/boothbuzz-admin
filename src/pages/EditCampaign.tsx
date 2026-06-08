import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Megaphone, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

interface FormData {
  name: string;
  description: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: CampaignStatus;
}

interface FormErrors {
  [key: string]: string;
}

export const EditCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    targetAudience: '',
    startDate: '',
    endDate: '',
    budget: 0,
    status: 'draft'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [linkedAdsCount, setLinkedAdsCount] = useState(0);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*, campaign_ads(advertisement_id)')
        .eq('id', id)
        .single();

      setLoading(false);
      if (campaignError || !campaign) {
        return;
      }

      const row = campaign as any;
      setFormData({
        name: row.name ?? '',
        description: row.description ?? '',
        targetAudience: row.target_audience ?? '',
        startDate: row.start_date ?? '',
        endDate: row.end_date ?? '',
        budget: Number(row.budget) ?? 0,
        status: row.status ?? 'draft'
      });
      setLinkedAdsCount(Array.isArray(row.campaign_ads) ? row.campaign_ads.length : 0);
    })();
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
    else if (formData.name.trim().length < 3) newErrors.name = 'Campaign name must be at least 3 characters';
    if (!formData.description.trim()) newErrors.description = 'Campaign description is required';
    if (formData.budget < 0) newErrors.budget = 'Budget cannot be negative';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !id) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim(),
          target_audience: formData.targetAudience.trim(),
          start_date: formData.startDate,
          end_date: formData.endDate,
          budget: formData.budget,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      setSubmitSuccess(true);
      setTimeout(() => navigate('/ads-sponsors'), 1500);
    } catch (err) {
      console.error('Error updating campaign:', err);
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to update campaign. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading campaign…</p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Updated</h2>
            <p className="text-gray-600 mb-6">Redirecting to Ads & Sponsors…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button variant="outline" onClick={() => navigate('/ads-sponsors')} className="mb-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Ads & Sponsors
      </Button>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Edit Campaign
          </h1>
          {linkedAdsCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">This campaign has {linkedAdsCount} linked advertisement(s).</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="e.g. Q1 Event Promotion"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as CampaignStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Campaign description"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. Society members aged 25-45"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.startDate ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.endDate ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹) *</label>
              <input
                type="number"
                min={0}
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value === '' ? 0 : Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg ${errors.budget ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="10000"
              />
              {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/ads-sponsors')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
