import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Save, 
  ArrowLeft, 
  Megaphone, 
  Target, 
  Calendar, 
  DollarSign,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
  Upload,
  Image,
  Video,
  FileText,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  BarChart3,
  MousePointer,
  TrendingUp,
  MapPin,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

interface CampaignAd {
  id: string;
  type: 'banner' | 'video' | 'sponsored_post' | 'popup' | 'native';
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  ctaText: string;
  ctaUrl: string;
  placement: string[];
  budget: number;
  bidStrategy: 'cpc' | 'cpm' | 'cpa';
  bidAmount: number;
}

interface TargetingOptions {
  demographics: {
    ageMin: number;
    ageMax: number;
    gender: 'all' | 'male' | 'female';
    income: 'all' | 'low' | 'medium' | 'high';
  };
  geographic: {
    countries: string[];
    cities: string[];
    radius: number;
  };
  interests: string[];
  behaviors: string[];
  devices: string[];
  platforms: string[];
}

interface FormData {
  name: string;
  description: string;
  objective: 'awareness' | 'traffic' | 'engagement' | 'conversions' | 'app_installs';
  campaignType: 'advertisement' | 'sponsorship' | 'hybrid';
  budget: number;
  budgetType: 'daily' | 'total';
  startDate: string;
  endDate: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused';
  targeting: TargetingOptions;
  ads: CampaignAd[];
  trackingPixel: string;
  conversionGoals: string[];
  frequencyCap: number;
  dayParting: boolean;
  activeHours: {
    start: string;
    end: string;
  };
  autoOptimization: boolean;
  abTesting: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const campaignObjectives = {
  awareness: {
    label: 'Brand Awareness',
    description: 'Increase visibility and recognition',
    icon: '👁️',
    metrics: ['Impressions', 'Reach', 'Brand Recall']
  },
  traffic: {
    label: 'Website Traffic',
    description: 'Drive visitors to your website',
    icon: '🌐',
    metrics: ['Clicks', 'CTR', 'Website Visits']
  },
  engagement: {
    label: 'Engagement',
    description: 'Increase interactions and engagement',
    icon: '💬',
    metrics: ['Likes', 'Comments', 'Shares', 'Engagement Rate']
  },
  conversions: {
    label: 'Conversions',
    description: 'Drive specific actions and sales',
    icon: '🎯',
    metrics: ['Conversions', 'CPA', 'ROAS', 'Revenue']
  },
  app_installs: {
    label: 'App Installs',
    description: 'Promote mobile app downloads',
    icon: '📱',
    metrics: ['Installs', 'CPI', 'App Opens', 'In-App Actions']
  }
};

const adPlacements = [
  { id: 'header', label: 'Header Banner', description: 'Top of page banner' },
  { id: 'sidebar', label: 'Sidebar', description: 'Side panel advertisements' },
  { id: 'footer', label: 'Footer', description: 'Bottom of page banner' },
  { id: 'event_page', label: 'Event Pages', description: 'Within event listings' },
  { id: 'mobile_app', label: 'Mobile App', description: 'In-app advertisements' },
  { id: 'newsletter', label: 'Newsletter', description: 'Email newsletter ads' },
  { id: 'social_feed', label: 'Social Feed', description: 'Social media style feed' },
  { id: 'search_results', label: 'Search Results', description: 'Search result pages' }
];

const targetingInterests = [
  'Event Planning', 'Community Events', 'Cultural Activities', 'Sports Events',
  'Technology', 'Business', 'Education', 'Health & Wellness', 'Food & Dining',
  'Entertainment', 'Arts & Culture', 'Music', 'Dance', 'Photography',
  'Travel', 'Fashion', 'Lifestyle', 'Family Activities', 'Youth Programs'
];

const targetingBehaviors = [
  'Event Attendees', 'Frequent Event Goers', 'Society Members', 'Community Leaders',
  'Online Shoppers', 'Mobile Users', 'Social Media Active', 'Early Adopters',
  'Budget Conscious', 'Premium Buyers', 'Local Residents', 'Commuters'
];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Kolkata', 'Ahmedabad'];

const PLACEMENTS: Record<string, 'header' | 'sidebar' | 'footer' | 'event_page' | 'mobile_app'> = {
  header: 'header',
  sidebar: 'sidebar',
  footer: 'footer',
  event_page: 'event_page',
  mobile_app: 'mobile_app'
};

export const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    objective: 'awareness',
    campaignType: 'advertisement',
    budget: 10000,
    budgetType: 'total',
    startDate: '',
    endDate: '',
    status: 'draft',
    targeting: {
      demographics: {
        ageMin: 18,
        ageMax: 65,
        gender: 'all',
        income: 'all'
      },
      geographic: {
        countries: ['India'],
        cities: [],
        radius: 50
      },
      interests: [],
      behaviors: [],
      devices: ['desktop', 'mobile', 'tablet'],
      platforms: ['web', 'mobile_app']
    },
    ads: [],
    trackingPixel: '',
    conversionGoals: [],
    frequencyCap: 3,
    dayParting: false,
    activeHours: {
      start: '09:00',
      end: '21:00'
    },
    autoOptimization: true,
    abTesting: false
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): { valid: boolean; newErrors: FormErrors } => {
    const newErrors: FormErrors = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Campaign name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Campaign description is required';
    }

    if (formData.budget < 1000) {
      newErrors.budget = 'Minimum budget is ₹1,000';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.ads.length === 0) {
      newErrors.ads = 'At least one advertisement is required';
    }

    const valid = Object.keys(newErrors).length === 0;
    setErrors(valid ? {} : { ...newErrors, submit: 'Please fix the errors below. Go back to the step(s) with issues and correct them, then click Create Campaign again.' });
    return { valid, newErrors };
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTargetingChange = (category: keyof TargetingOptions, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        [category]: field ? {
          ...prev.targeting[category],
          [field]: value
        } : value
      }
    }));
  };

  const addNewAd = () => {
    const newAd: CampaignAd = {
      id: Date.now().toString(),
      type: 'banner',
      title: '',
      description: '',
      imageUrl: '',
      ctaText: 'Learn More',
      ctaUrl: '',
      placement: ['header'],
      budget: Math.floor(formData.budget * 0.3),
      bidStrategy: 'cpm',
      bidAmount: 50
    };
    
    setFormData(prev => ({
      ...prev,
      ads: [...prev.ads, newAd]
    }));
  };

  const updateAd = (adId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ads: prev.ads.map(ad =>
        ad.id === adId ? { ...ad, [field]: value } : ad
      )
    }));
  };

  const removeAd = (adId: string) => {
    setFormData(prev => ({
      ...prev,
      ads: prev.ads.filter(ad => ad.id !== adId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { valid, newErrors } = validateForm();
    if (!valid) {
      // Jump to first step that has an error so user can fix it
      if (newErrors.name || newErrors.description) setActiveStep(1);
      else if (newErrors.budget || newErrors.startDate || newErrors.endDate) setActiveStep(2);
      else if (newErrors.ads) setActiveStep(3);
      return;
    }

    setErrors(prev => ({ ...prev, submit: '' }));
    setIsSubmitting(true);

    try {
      const organizationId = user?.organizationId ?? null;
      const targetAudience = formData.targeting.geographic.cities.length > 0
        ? formData.targeting.geographic.cities.join(', ')
        : `Age ${formData.targeting.demographics.ageMin}-${formData.targeting.demographics.ageMax}`;

      const { data: campaignRow, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          organization_id: organizationId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          target_audience: targetAudience,
          start_date: formData.startDate,
          end_date: formData.endDate,
          budget: formData.budget,
          spent: 0,
          status: formData.status,
          performance: { impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpc: 0 }
        })
        .select('id')
        .single();

      if (campaignError || !campaignRow?.id) {
        throw new Error(campaignError?.message ?? 'Failed to create campaign');
      }

      const campaignId = campaignRow.id;
      const advertisementIds: string[] = [];

      for (const ad of formData.ads) {
        const adType = ad.type === 'native' ? 'banner' : ad.type;
        const placement = (ad.placement?.[0] && PLACEMENTS[ad.placement[0]]) ? PLACEMENTS[ad.placement[0]] : 'header';
        const { data: adRow, error: adError } = await supabase
          .from('advertisements')
          .insert({
            organization_id: organizationId,
            title: ad.title?.trim() || formData.name.trim(),
            advertiser: formData.name.trim(),
            type: adType,
            placement,
            start_date: formData.startDate,
            end_date: formData.endDate,
            budget: ad.budget ?? 0,
            spent: 0,
            impressions: 0,
            clicks: 0,
            status: formData.status,
            ctr: 0,
            cpm: ad.bidStrategy === 'cpm' ? (ad.bidAmount ?? 0) : 0
          })
          .select('id')
          .single();

        if (adError || !adRow?.id) {
          throw new Error(adError?.message ?? 'Failed to create advertisement');
        }
        advertisementIds.push(adRow.id);
      }

      if (advertisementIds.length > 0) {
        const { error: linkError } = await supabase
          .from('campaign_ads')
          .insert(advertisementIds.map(advertisement_id => ({ campaign_id: campaignId, advertisement_id })));

        if (linkError) {
          throw new Error(linkError.message);
        }
      }

      setSubmitSuccess(true);
      setTimeout(() => navigate('/ads-sponsors'), 1500);
    } catch (error) {
      console.error('Error creating campaign:', error);
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'Failed to create campaign. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEstimatedReach = () => {
    const baseReach = 100000;
    const cityMultiplier = formData.targeting.geographic.cities.length || 1;
    const interestMultiplier = formData.targeting.interests.length > 0 ? 0.7 : 1;
    const ageRange = formData.targeting.demographics.ageMax - formData.targeting.demographics.ageMin;
    const ageMultiplier = ageRange / 47; // 47 is max age range (65-18)
    
    return Math.floor(baseReach * cityMultiplier * interestMultiplier * ageMultiplier);
  };

  const calculateEstimatedCost = () => {
    const baseCPM = 100;
    const estimatedReach = calculateEstimatedReach();
    const impressions = estimatedReach * 2; // Assume 2 impressions per person
    return Math.floor((impressions / 1000) * baseCPM);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Created Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your campaign "{formData.name}" has been created and is ready to launch.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/ads-sponsors')} className="w-full">
                Go to Ads & Sponsors
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSubmitSuccess(false);
                  setFormData({
                    name: '',
                    description: '',
                    objective: 'awareness',
                    campaignType: 'advertisement',
                    budget: 10000,
                    budgetType: 'total',
                    startDate: '',
                    endDate: '',
                    status: 'draft',
                    targeting: {
                      demographics: {
                        ageMin: 18,
                        ageMax: 65,
                        gender: 'all',
                        income: 'all'
                      },
                      geographic: {
                        countries: ['India'],
                        cities: [],
                        radius: 50
                      },
                      interests: [],
                      behaviors: [],
                      devices: ['desktop', 'mobile', 'tablet'],
                      platforms: ['web', 'mobile_app']
                    },
                    ads: [],
                    trackingPixel: '',
                    conversionGoals: [],
                    frequencyCap: 3,
                    dayParting: false,
                    activeHours: {
                      start: '09:00',
                      end: '21:00'
                    },
                    autoOptimization: true,
                    abTesting: false
                  });
                }}
                className="w-full"
              >
                Create Another Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Campaign Details', icon: Megaphone },
    { id: 2, title: 'Targeting & Budget', icon: Target },
    { id: 3, title: 'Advertisements', icon: Image },
    { id: 4, title: 'Review & Launch', icon: CheckCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/ads-sponsors')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Ads & Sponsors</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Campaign</h1>
            <p className="text-gray-600">Design and launch your marketing campaign</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  activeStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    activeStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-24 h-1 mx-4 ${
                    activeStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Campaign Details */}
            {activeStep === 1 && (
              <>
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Megaphone className="h-5 w-5 mr-2" />
                      Campaign Information
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campaign Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Q1 Event Promotion"
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
                          Campaign Type
                        </label>
                        <select
                          value={formData.campaignType}
                          onChange={(e) => handleInputChange('campaignType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="advertisement">Advertisement Campaign</option>
                          <option value="sponsorship">Sponsorship Campaign</option>
                          <option value="hybrid">Hybrid Campaign</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Describe your campaign goals and strategy..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Campaign Objective *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(campaignObjectives).map(([key, objective]) => (
                          <div
                            key={key}
                            onClick={() => handleInputChange('objective', key)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                              formData.objective === key
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <span className="text-2xl mr-3">{objective.icon}</span>
                              <h4 className="font-medium text-gray-900">{objective.label}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{objective.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {objective.metrics.map((metric) => (
                                <Badge key={metric} variant="default" className="text-xs">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Schedule & Budget
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.startDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.startDate && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.startDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.endDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.endDate && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.endDate}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Type
                        </label>
                        <select
                          value={formData.budgetType}
                          onChange={(e) => handleInputChange('budgetType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="total">Total Budget</option>
                          <option value="daily">Daily Budget</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Amount (₹) *
                        </label>
                        <input
                          type="number"
                          value={formData.budget}
                          onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.budget ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="10000"
                          min="1000"
                          step="100"
                        />
                        {errors.budget && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.budget}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Step 2: Targeting & Budget */}
            {activeStep === 2 && (
              <>
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Audience Targeting
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Demographics */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Demographics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Age Range
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={formData.targeting.demographics.ageMin}
                              onChange={(e) => handleTargetingChange('demographics', 'ageMin', parseInt(e.target.value))}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="13"
                              max="65"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="number"
                              value={formData.targeting.demographics.ageMax}
                              onChange={(e) => handleTargetingChange('demographics', 'ageMax', parseInt(e.target.value))}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="13"
                              max="65"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <select
                            value={formData.targeting.demographics.gender}
                            onChange={(e) => handleTargetingChange('demographics', 'gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="all">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Income Level
                          </label>
                          <select
                            value={formData.targeting.demographics.income}
                            onChange={(e) => handleTargetingChange('demographics', 'income', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="all">All Income Levels</option>
                            <option value="low">Low Income</option>
                            <option value="medium">Medium Income</option>
                            <option value="high">High Income</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Geographic */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Geographic Targeting</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Cities
                          </label>
                          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                            {cities.map((city) => (
                              <label key={city} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.targeting.geographic.cities.includes(city)}
                                  onChange={(e) => {
                                    const cities = formData.targeting.geographic.cities;
                                    if (e.target.checked) {
                                      handleTargetingChange('geographic', 'cities', [...cities, city]);
                                    } else {
                                      handleTargetingChange('geographic', 'cities', cities.filter(c => c !== city));
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{city}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Radius (km)
                          </label>
                          <input
                            type="number"
                            value={formData.targeting.geographic.radius}
                            onChange={(e) => handleTargetingChange('geographic', 'radius', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="1"
                            max="500"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Target audience within this radius of selected cities
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interests */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Interests</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {targetingInterests.map((interest) => (
                          <label key={interest} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.targeting.interests.includes(interest)}
                              onChange={(e) => {
                                const interests = formData.targeting.interests;
                                if (e.target.checked) {
                                  handleTargetingChange('interests', '', [...interests, interest]);
                                } else {
                                  handleTargetingChange('interests', '', interests.filter(i => i !== interest));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{interest}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Behaviors */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Behaviors</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {targetingBehaviors.map((behavior) => (
                          <label key={behavior} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.targeting.behaviors.includes(behavior)}
                              onChange={(e) => {
                                const behaviors = formData.targeting.behaviors;
                                if (e.target.checked) {
                                  handleTargetingChange('behaviors', '', [...behaviors, behavior]);
                                } else {
                                  handleTargetingChange('behaviors', '', behaviors.filter(b => b !== behavior));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{behavior}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Monitor className="h-5 w-5 mr-2" />
                      Platform & Device Targeting
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Devices</h4>
                        <div className="space-y-2">
                          {[
                            { id: 'desktop', label: 'Desktop', icon: Monitor },
                            { id: 'mobile', label: 'Mobile', icon: Smartphone },
                            { id: 'tablet', label: 'Tablet', icon: Tablet }
                          ].map((device) => (
                            <label key={device.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.targeting.devices.includes(device.id)}
                                onChange={(e) => {
                                  const devices = formData.targeting.devices;
                                  if (e.target.checked) {
                                    handleTargetingChange('devices', '', [...devices, device.id]);
                                  } else {
                                    handleTargetingChange('devices', '', devices.filter(d => d !== device.id));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <device.icon className="h-4 w-4 ml-2 mr-2 text-gray-500" />
                              <span className="text-sm text-gray-700">{device.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Platforms</h4>
                        <div className="space-y-2">
                          {[
                            { id: 'web', label: 'Website', icon: Globe },
                            { id: 'mobile_app', label: 'Mobile App', icon: Smartphone }
                          ].map((platform) => (
                            <label key={platform.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.targeting.platforms.includes(platform.id)}
                                onChange={(e) => {
                                  const platforms = formData.targeting.platforms;
                                  if (e.target.checked) {
                                    handleTargetingChange('platforms', '', [...platforms, platform.id]);
                                  } else {
                                    handleTargetingChange('platforms', '', platforms.filter(p => p !== platform.id));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <platform.icon className="h-4 w-4 ml-2 mr-2 text-gray-500" />
                              <span className="text-sm text-gray-700">{platform.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Step 3: Advertisements */}
            {activeStep === 3 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Image className="h-5 w-5 mr-2" />
                      Campaign Advertisements
                    </h3>
                    <Button
                      type="button"
                      onClick={addNewAd}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Advertisement</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {formData.ads.length === 0 ? (
                    <div className="text-center py-8">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No advertisements yet</h4>
                      <p className="text-gray-600 mb-4">Create your first advertisement to get started</p>
                      <Button onClick={addNewAd} className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Create Advertisement</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {formData.ads.map((ad, index) => (
                        <Card key={ad.id} className="border border-gray-200">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-900">Advertisement #{index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAd(ad.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Ad Type
                                </label>
                                <select
                                  value={ad.type}
                                  onChange={(e) => updateAd(ad.id, 'type', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="banner">Banner Ad</option>
                                  <option value="video">Video Ad</option>
                                  <option value="sponsored_post">Sponsored Post</option>
                                  <option value="popup">Popup Ad</option>
                                  <option value="native">Native Ad</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Bid Strategy
                                </label>
                                <select
                                  value={ad.bidStrategy}
                                  onChange={(e) => updateAd(ad.id, 'bidStrategy', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="cpm">CPM (Cost per 1000 impressions)</option>
                                  <option value="cpc">CPC (Cost per click)</option>
                                  <option value="cpa">CPA (Cost per action)</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Ad Title
                                </label>
                                <input
                                  type="text"
                                  value={ad.title}
                                  onChange={(e) => updateAd(ad.id, 'title', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter ad title"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  CTA Text
                                </label>
                                <input
                                  type="text"
                                  value={ad.ctaText}
                                  onChange={(e) => updateAd(ad.id, 'ctaText', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g., Learn More"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ad Description
                              </label>
                              <textarea
                                value={ad.description}
                                onChange={(e) => updateAd(ad.id, 'description', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe your advertisement"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Landing URL
                                </label>
                                <input
                                  type="url"
                                  value={ad.ctaUrl}
                                  onChange={(e) => updateAd(ad.id, 'ctaUrl', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="https://example.com"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Ad Budget (₹)
                                </label>
                                <input
                                  type="number"
                                  value={ad.budget}
                                  onChange={(e) => updateAd(ad.id, 'budget', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  min="100"
                                  step="100"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ad Placements
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {adPlacements.map((placement) => (
                                  <label key={placement.id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={ad.placement.includes(placement.id)}
                                      onChange={(e) => {
                                        const placements = ad.placement;
                                        if (e.target.checked) {
                                          updateAd(ad.id, 'placement', [...placements, placement.id]);
                                        } else {
                                          updateAd(ad.id, 'placement', placements.filter(p => p !== placement.id));
                                        }
                                      }}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{placement.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center space-x-2"
                                >
                                  <Upload className="h-4 w-4" />
                                  <span>Upload Creative</span>
                                </Button>
                                {ad.type === 'video' && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center space-x-2"
                                  >
                                    <Video className="h-4 w-4" />
                                    <span>Upload Video</span>
                                  </Button>
                                )}
                              </div>
                              <Badge variant="default">
                                {ad.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {errors.ads && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.ads}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Launch */}
            {activeStep === 4 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Campaign Review
                  </h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Campaign Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{formData.campaignType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Objective:</span>
                          <span className="font-medium">{campaignObjectives[formData.objective].label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">
                            {formData.startDate} to {formData.endDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Budget & Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-medium">₹{formData.budget.toLocaleString()} ({formData.budgetType})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Reach:</span>
                          <span className="font-medium">{calculateEstimatedReach().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Cost:</span>
                          <span className="font-medium">₹{calculateEstimatedCost().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Advertisements:</span>
                          <span className="font-medium">{formData.ads.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Targeting Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Demographics</h5>
                        <div className="text-sm text-gray-600">
                          <p>Age: {formData.targeting.demographics.ageMin}-{formData.targeting.demographics.ageMax}</p>
                          <p>Gender: {formData.targeting.demographics.gender}</p>
                          <p>Income: {formData.targeting.demographics.income}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Geographic</h5>
                        <div className="text-sm text-gray-600">
                          <p>Cities: {formData.targeting.geographic.cities.length || 'All'}</p>
                          <p>Radius: {formData.targeting.geographic.radius}km</p>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Interests & Behaviors</h5>
                        <div className="text-sm text-gray-600">
                          <p>Interests: {formData.targeting.interests.length}</p>
                          <p>Behaviors: {formData.targeting.behaviors.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Campaign Status</h4>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="draft"
                          checked={formData.status === 'draft'}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Save as Draft</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="scheduled"
                          checked={formData.status === 'scheduled'}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Schedule for Launch</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Launch Immediately</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Summary */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Campaign Summary</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{formData.budget.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">{formData.budgetType} budget</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Objective:</span>
                      <span className="font-medium">{campaignObjectives[formData.objective]?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {formData.startDate && formData.endDate
                          ? `${Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                          : 'Not set'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ads:</span>
                      <span className="font-medium">{formData.ads.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Cities:</span>
                      <span className="font-medium">
                        {formData.targeting.geographic.cities.length || 'All'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Estimated Performance
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reach:</span>
                        <span className="font-medium">{calculateEstimatedReach().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impressions:</span>
                        <span className="font-medium">{(calculateEstimatedReach() * 2).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Clicks:</span>
                        <span className="font-medium">{Math.floor(calculateEstimatedReach() * 0.02).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Setup Progress</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { step: 1, label: 'Campaign Details', completed: formData.name && formData.description },
                    { step: 2, label: 'Targeting & Budget', completed: formData.budget > 0 && formData.startDate && formData.endDate },
                    { step: 3, label: 'Advertisements', completed: formData.ads.length > 0 },
                    { step: 4, label: 'Review & Launch', completed: false }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        item.completed
                          ? 'bg-green-100 text-green-600'
                          : activeStep >= item.step
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {item.completed ? '✓' : item.step}
                      </div>
                      <span className={`ml-3 text-sm ${
                        item.completed ? 'text-green-600' : 'text-gray-700'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Campaign Tips
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Define clear objectives to measure success</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Target specific audiences for better performance</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Create compelling ad creatives with clear CTAs</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p>Monitor performance and optimize regularly</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="space-y-3">
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.submit}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                {activeStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveStep(activeStep - 1)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Previous
                  </Button>
                )}
                
                {activeStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Create Campaign</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/ads-sponsors')}
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