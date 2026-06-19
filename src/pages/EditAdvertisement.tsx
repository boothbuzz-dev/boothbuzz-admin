import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { ArrowLeft, Image, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

type AdType = 'banner' | 'video' | 'sponsored_post' | 'popup';
type Placement = 'header' | 'sidebar' | 'footer' | 'event_page' | 'mobile_app';
type AdStatus = 'active' | 'paused' | 'completed' | 'draft';

const PLACEMENTS: Placement[] = ['header', 'sidebar', 'footer', 'event_page', 'mobile_app'];
const AD_TYPES: AdType[] = ['banner', 'video', 'sponsored_post', 'popup'];

interface FormData {
  title: string;
  advertiser: string;
  type: AdType;
  placement: Placement;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: AdStatus;
  ctr: number;
  cpm: number;
}

interface FormErrors {
  [key: string]: string;
}

export const EditAdvertisement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    advertiser: '',
    type: 'banner',
    placement: 'header',
    startDate: '',
    endDate: '',
    budget: 0,
    spent: 0,
    impressions: 0,
    clicks: 0,
    status: 'draft',
    ctr: 0,
    cpm: 0
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    apiClient
      .from('advertisements')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) return;
        const row = data as any;
        setFormData({
          title: row.title ?? '',
          advertiser: row.advertiser ?? '',
          type: row.type ?? 'banner',
          placement: row.placement ?? 'header',
          startDate: row.start_date ?? '',
          endDate: row.end_date ?? '',
          budget: Number(row.budget) ?? 0,
          spent: Number(row.spent) ?? 0,
          impressions: Number(row.impressions) ?? 0,
          clicks: Number(row.clicks) ?? 0,
          status: row.status ?? 'draft',
          ctr: Number(row.ctr) ?? 0,
          cpm: Number(row.cpm) ?? 0
        });
      });
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.advertiser.trim()) newErrors.advertiser = 'Advertiser is required';
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
      const { error } = await apiClient
        .from('advertisements')
        .update({
          title: formData.title.trim(),
          advertiser: formData.advertiser.trim(),
          type: formData.type,
          placement: formData.placement,
          start_date: formData.startDate,
          end_date: formData.endDate,
          budget: formData.budget,
          spent: formData.spent,
          impressions: formData.impressions,
          clicks: formData.clicks,
          status: formData.status,
          ctr: formData.ctr,
          cpm: formData.cpm,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      setSubmitSuccess(true);
      setTimeout(() => navigate('/ads-sponsors'), 1500);
    } catch (err) {
      console.error('Error updating advertisement:', err);
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to update advertisement. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading advertisement…</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Advertisement Updated</h2>
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
            <Image className="h-6 w-6" />
            Edit Advertisement
          </h1>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Ad title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Advertiser *</label>
                <input
                  type="text"
                  value={formData.advertiser}
                  onChange={(e) => handleInputChange('advertiser', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.advertiser ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Advertiser name"
                />
                {errors.advertiser && <p className="mt-1 text-sm text-red-600">{errors.advertiser}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as AdType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {AD_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placement</label>
                <select
                  value={formData.placement}
                  onChange={(e) => handleInputChange('placement', e.target.value as Placement)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {PLACEMENTS.map((p) => (
                    <option key={p} value={p}>{p.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹) *</label>
                <input
                  type="number"
                  min={0}
                  value={formData.budget || ''}
                  onChange={(e) => handleInputChange('budget', e.target.value === '' ? 0 : Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.budget ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spent (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.spent || ''}
                  onChange={(e) => handleInputChange('spent', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Impressions</label>
                <input
                  type="number"
                  min={0}
                  value={formData.impressions || ''}
                  onChange={(e) => handleInputChange('impressions', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clicks</label>
                <input
                  type="number"
                  min={0}
                  value={formData.clicks || ''}
                  onChange={(e) => handleInputChange('clicks', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTR (%)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.ctr ?? ''}
                  onChange={(e) => handleInputChange('ctr', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CPM</label>
                <input
                  type="number"
                  min={0}
                  value={formData.cpm ?? ''}
                  onChange={(e) => handleInputChange('cpm', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as AdStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
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
