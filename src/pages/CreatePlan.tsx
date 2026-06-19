import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  CreditCard, 
  Users, 
  Calendar, 
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Trash2,
  Eye,
  Copy,
  Zap,
  Shield,
  Headphones,
  Globe,
  Database,
  Smartphone
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { apiClient } from '../lib/apiClient';

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unlimited?: boolean;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  maxEvents: number;
  maxAttendees: number;
  maxSocieties: number;
  supportLevel: 'email' | 'phone' | 'priority' | 'dedicated';
  features: PlanFeature[];
  isPopular: boolean;
  isActive: boolean;
  trialDays: number;
  setupFee: number;
  discountPercentage: number;
  customBranding: boolean;
  apiAccess: boolean;
  advancedReporting: boolean;
  whiteLabel: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const defaultFeatures: PlanFeature[] = [
  {
    id: '1',
    name: 'Event Management',
    description: 'Create and manage events',
    included: true
  },
  {
    id: '2',
    name: 'Attendee Registration',
    description: 'Online registration system',
    included: true
  },
  {
    id: '3',
    name: 'Basic Analytics',
    description: 'Event performance metrics',
    included: true
  },
  {
    id: '4',
    name: 'Email Notifications',
    description: 'Automated email communications',
    included: true
  },
  {
    id: '5',
    name: 'Mobile App Access',
    description: 'iOS and Android apps',
    included: true
  },
  {
    id: '6',
    name: 'Vendor Management',
    description: 'Manage service providers',
    included: false
  },
  {
    id: '7',
    name: 'Advanced Reporting',
    description: 'Detailed analytics and reports',
    included: false
  },
  {
    id: '8',
    name: 'Custom Branding',
    description: 'White-label solution',
    included: false
  },
  {
    id: '9',
    name: 'API Access',
    description: 'Integration capabilities',
    included: false
  },
  {
    id: '10',
    name: 'Priority Support',
    description: '24/7 priority assistance',
    included: false
  }
];

const supportLevels = {
  email: { label: 'Email Support', description: 'Email support during business hours', icon: '📧' },
  phone: { label: 'Phone & Email', description: 'Phone and email support', icon: '📞' },
  priority: { label: 'Priority Support', description: '24/7 priority support', icon: '⚡' },
  dedicated: { label: 'Dedicated Manager', description: 'Dedicated account manager', icon: '👤' }
};

const slugifyCode = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const CreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    maxEvents: 5,
    maxAttendees: 200,
    maxSocieties: 1,
    supportLevel: 'email',
    features: defaultFeatures,
    isPopular: false,
    isActive: true,
    trialDays: 14,
    setupFee: 0,
    discountPercentage: 0,
    customBranding: false,
    apiAccess: false,
    advancedReporting: false,
    whiteLabel: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Plan name must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Plan description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Price validation
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    } else if (formData.price > 1000000) {
      newErrors.price = 'Price cannot exceed ₹10,00,000';
    }

    // Limits validation
    if (formData.maxEvents < 1) {
      newErrors.maxEvents = 'Must allow at least 1 event';
    }

    if (formData.maxAttendees < 10) {
      newErrors.maxAttendees = 'Must allow at least 10 attendees';
    }

    if (formData.maxSocieties < 1) {
      newErrors.maxSocieties = 'Must allow at least 1 society';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(feature =>
        feature.id === featureId
          ? { ...feature, included: !feature.included }
          : feature
      )
    }));
  };

  const addCustomFeature = () => {
    const newFeature: PlanFeature = {
      id: Date.now().toString(),
      name: '',
      description: '',
      included: true
    };
    
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  const updateCustomFeature = (featureId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(feature =>
        feature.id === featureId
          ? { ...feature, [field]: value }
          : feature
      )
    }));
  };

  const removeCustomFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature.id !== featureId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const code = slugifyCode(formData.name);
      if (!code) {
        setErrors({ submit: 'Plan name must include letters or numbers.' });
        return;
      }
      const includedFeatures = formData.features
        .filter((f) => f.included && f.name.trim().length > 0)
        .map((f) => f.name.trim());
      const limits = {
        max_events: formData.maxEvents,
        max_attendees: formData.maxAttendees,
        max_societies: formData.maxSocieties,
        support_level: formData.supportLevel,
        billing_cycle: formData.billingCycle,
        setup_fee_inr: formData.setupFee,
        discount_percentage: formData.discountPercentage,
        custom_branding: formData.customBranding,
        api_access: formData.apiAccess,
        advanced_reporting: formData.advancedReporting,
        white_label: formData.whiteLabel,
        promotional_video_ads: includedFeatures.some((f) =>
          /video|advert|campaign/i.test(f),
        ),
      };

      const { error } = await apiClient.from('vendor_subscription_plans').insert({
        code,
        name: formData.name.trim(),
        description: formData.description.trim(),
        monthly_price_inr: Math.max(0, Math.round(formData.price)),
        trial_days: Math.max(0, formData.trialDays || 0),
        is_active: formData.isActive,
        is_popular: formData.isPopular,
        rank_order: 999,
        features: includedFeatures,
        limits,
      });

      if (error) {
        throw error;
      }

      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/billing');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating plan:', error);
      setErrors({ submit: error?.message || 'Failed to create plan. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateYearlyPrice = () => {
    const yearlyMultiplier = formData.billingCycle === 'yearly' ? 12 : formData.billingCycle === 'quarterly' ? 3 : 1;
    const discount = formData.discountPercentage / 100;
    return formData.price * yearlyMultiplier * (1 - discount);
  };

  const getIncludedFeatures = () => formData.features.filter(f => f.included);
  const getExcludedFeatures = () => formData.features.filter(f => !f.included);

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Created Successfully!</h2>
            <p className="text-gray-600 mb-6">
              The new subscription plan "{formData.name}" has been created and is now available for societies.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/billing')} className="w-full">
                Go to Plans & Billing
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSubmitSuccess(false);
                  setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    billingCycle: 'monthly',
                    maxEvents: 5,
                    maxAttendees: 200,
                    maxSocieties: 1,
                    supportLevel: 'email',
                    features: defaultFeatures,
                    isPopular: false,
                    isActive: true,
                    trialDays: 14,
                    setupFee: 0,
                    discountPercentage: 0,
                    customBranding: false,
                    apiAccess: false,
                    advancedReporting: false,
                    whiteLabel: false
                  });
                }}
                className="w-full"
              >
                Create Another Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(false)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Edit</span>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Plan Preview</h1>
              <p className="text-gray-600">Preview how your plan will appear to customers</p>
            </div>
          </div>
          <Button onClick={() => setPreviewMode(false)}>
            Continue Editing
          </Button>
        </div>

        {/* Plan Preview Card */}
        <div className="max-w-md mx-auto">
          <Card className={`relative ${formData.isPopular ? 'ring-2 ring-blue-500' : ''}`}>
            {formData.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  Most Popular
                </span>
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{formData.name || 'Plan Name'}</h3>
                <p className="text-gray-600 mt-2">{formData.description || 'Plan description'}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">₹{formData.price.toLocaleString()}</span>
                  <span className="text-gray-600">/{formData.billingCycle}</span>
                  {formData.discountPercentage > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      Save {formData.discountPercentage}% on {formData.billingCycle} billing
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Max Events:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {formData.maxEvents === -1 ? 'Unlimited' : formData.maxEvents}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Attendees:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {formData.maxAttendees === -1 ? 'Unlimited' : formData.maxAttendees}
                    </span>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Support:</span>
                  <span className="font-medium text-gray-900 ml-2">
                    {supportLevels[formData.supportLevel].label}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {getIncludedFeatures().map((feature) => (
                  <li key={feature.id} className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature.name}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full">
                Choose {formData.name || 'This Plan'}
              </Button>

              {formData.trialDays > 0 && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  {formData.trialDays}-day free trial included
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/billing')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Billing</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Plan</h1>
            <p className="text-gray-600">Design a new subscription plan for societies</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setPreviewMode(true)}
          className="flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Plan Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Professional Plan"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Cycle *
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe what this plan offers..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                      step="1"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Setup Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.setupFee}
                      onChange={(e) => handleInputChange('setupFee', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan Limits */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Plan Limits
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Events per Month *
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.maxEvents === -1 ? '' : formData.maxEvents}
                        onChange={(e) => handleInputChange('maxEvents', parseInt(e.target.value) || 0)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.maxEvents ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="5"
                        min="1"
                        disabled={formData.maxEvents === -1}
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.maxEvents === -1}
                          onChange={(e) => handleInputChange('maxEvents', e.target.checked ? -1 : 5)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Unlimited</span>
                      </label>
                    </div>
                    {errors.maxEvents && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.maxEvents}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Attendees per Event *
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.maxAttendees === -1 ? '' : formData.maxAttendees}
                        onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value) || 0)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.maxAttendees ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="200"
                        min="10"
                        disabled={formData.maxAttendees === -1}
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.maxAttendees === -1}
                          onChange={(e) => handleInputChange('maxAttendees', e.target.checked ? -1 : 200)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Unlimited</span>
                      </label>
                    </div>
                    {errors.maxAttendees && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.maxAttendees}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Societies *
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.maxSocieties === -1 ? '' : formData.maxSocieties}
                        onChange={(e) => handleInputChange('maxSocieties', parseInt(e.target.value) || 0)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.maxSocieties ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="1"
                        min="1"
                        disabled={formData.maxSocieties === -1}
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.maxSocieties === -1}
                          onChange={(e) => handleInputChange('maxSocieties', e.target.checked ? -1 : 1)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Unlimited</span>
                      </label>
                    </div>
                    {errors.maxSocieties && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.maxSocieties}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Level
                    </label>
                    <select
                      value={formData.supportLevel}
                      onChange={(e) => handleInputChange('supportLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(supportLevels).map(([key, level]) => (
                        <option key={key} value={key}>
                          {level.icon} {level.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      {supportLevels[formData.supportLevel].description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Trial (Days)
                    </label>
                    <input
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) => handleInputChange('trialDays', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="14"
                      min="0"
                      max="90"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      0 for no trial period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Plan Features
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomFeature}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Feature</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.features.map((feature, index) => (
                    <div key={feature.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={feature.included}
                          onChange={() => handleFeatureToggle(feature.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        {index >= defaultFeatures.length ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={feature.name}
                              onChange={(e) => updateCustomFeature(feature.id, 'name', e.target.value)}
                              placeholder="Feature name"
                              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              value={feature.description}
                              onChange={(e) => updateCustomFeature(feature.id, 'description', e.target.value)}
                              placeholder="Feature description"
                              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900">{feature.name}</div>
                            <div className="text-sm text-gray-500">{feature.description}</div>
                          </div>
                        )}
                      </div>
                      {index >= defaultFeatures.length && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomFeature(feature.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Advanced Options
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={(e) => handleInputChange('isPopular', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Mark as Popular</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Active Plan</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.customBranding}
                        onChange={(e) => handleInputChange('customBranding', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Custom Branding</span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.apiAccess}
                        onChange={(e) => handleInputChange('apiAccess', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">API Access</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.advancedReporting}
                        onChange={(e) => handleInputChange('advancedReporting', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Advanced Reporting</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.whiteLabel}
                        onChange={(e) => handleInputChange('whiteLabel', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">White Label Solution</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Plan Summary</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{formData.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">per {formData.billingCycle}</div>
                    {formData.discountPercentage > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        {formData.discountPercentage}% discount applied
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Events:</span>
                      <span className="font-medium">
                        {formData.maxEvents === -1 ? 'Unlimited' : formData.maxEvents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendees:</span>
                      <span className="font-medium">
                        {formData.maxAttendees === -1 ? 'Unlimited' : formData.maxAttendees}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Societies:</span>
                      <span className="font-medium">
                        {formData.maxSocieties === -1 ? 'Unlimited' : formData.maxSocieties}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Support:</span>
                      <span className="font-medium">{supportLevels[formData.supportLevel].label}</span>
                    </div>
                    {formData.trialDays > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trial:</span>
                        <span className="font-medium">{formData.trialDays} days</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Included Features ({getIncludedFeatures().length})
                    </div>
                    <div className="space-y-1">
                      {getIncludedFeatures().slice(0, 5).map((feature) => (
                        <div key={feature.id} className="flex items-center text-xs text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{feature.name}</span>
                        </div>
                      ))}
                      {getIncludedFeatures().length > 5 && (
                        <div className="text-xs text-gray-500">
                          +{getIncludedFeatures().length - 5} more features
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={() => setPreviewMode(true)}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview Plan</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy from Existing</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Guidelines
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Choose clear, descriptive names for your plans</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Set appropriate limits based on target audience</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Include features that provide clear value</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Consider offering free trials to attract customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.submit}
                  </p>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Plan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Plan</span>
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/billing')}
                className="w-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};