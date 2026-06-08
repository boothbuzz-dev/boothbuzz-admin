import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, DollarSign, Clock, AlertTriangle, Plus, Eye, CheckCircle, Edit } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import {
  useVendorBillingInvoices,
  useVendorSubscriptionPlans,
  useVendorSubscriptions,
} from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';

type TabId = 'plans' | 'invoices' | 'subscriptions';

type BillingPlan = {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPriceInr: number;
  trialDays: number;
  isActive: boolean;
  isPopular: boolean;
  rankOrder: number;
  features: string[];
  limits: Record<string, unknown>;
};

type PlanAreaRow = { area: string; value: string };

const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'paid':
    case 'active':
      return 'success';
    case 'pending':
    case 'trial':
      return 'warning';
    case 'overdue':
    case 'expired':
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const humanizeKey = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const stringifyAreaValue = (value: unknown): string => {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Included' : 'Not included';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '—';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((v) => String(v)).join(', ');
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    return entries.length === 0
      ? '—'
      : entries.map(([k, v]) => `${humanizeKey(k)}: ${stringifyAreaValue(v)}`).join(' • ');
  }
  return String(value);
};

const getPlanAreaRows = (plan: BillingPlan): PlanAreaRow[] => {
  const limits = (plan.limits ?? {}) as Record<string, unknown>;
  const areaOrder = ['core', 'events', 'storage', 'users', 'registrations', 'sponsors_ads'];
  const areas = limits.areas && typeof limits.areas === 'object'
    ? (limits.areas as Record<string, unknown>)
    : null;

  if (areas) {
    const rows = areaOrder
      .filter((k) => areas[k] != null)
      .map((k) => ({ area: humanizeKey(k), value: stringifyAreaValue(areas[k]) }));
    const remaining = Object.keys(areas)
      .filter((k) => !areaOrder.includes(k))
      .map((k) => ({ area: humanizeKey(k), value: stringifyAreaValue(areas[k]) }));
    return [...rows, ...remaining];
  }

  const fallbackKeys = [
    'max_events',
    'max_attendees',
    'max_societies',
    'max_active_campaigns',
    'promotional_video_ads',
  ];
  const fallbackRows = fallbackKeys
    .filter((k) => limits[k] != null)
    .map((k) => ({ area: humanizeKey(k), value: stringifyAreaValue(limits[k]) }));
  if (fallbackRows.length > 0) return fallbackRows;

  return [{ area: 'Features', value: plan.features.join(', ') || '—' }];
};

export const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('plans');
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [planForm, setPlanForm] = useState<{
    name: string;
    description: string;
    monthlyPriceInr: number;
    trialDays: number;
    isActive: boolean;
    isPopular: boolean;
    featuresText: string;
    areaCore: string;
    areaEvents: string;
    areaStorage: string;
    areaUsers: string;
    areaRegistrations: string;
    areaSponsorsAds: string;
  } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);

  const { plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = useVendorSubscriptionPlans();
  const { invoices, loading: invoicesLoading, error: invoicesError } = useVendorBillingInvoices();
  const { subscriptions, loading: subsLoading, error: subsError } = useVendorSubscriptions();

  const totalRevenue = useMemo(
    () => invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.amountInr : 0), 0),
    [invoices],
  );
  const pendingAmount = useMemo(
    () => invoices.reduce((sum, inv) => sum + (inv.status === 'pending' ? inv.amountInr : 0), 0),
    [invoices],
  );
  const overdueAmount = useMemo(
    () => invoices.reduce((sum, inv) => sum + (inv.status === 'overdue' ? inv.amountInr : 0), 0),
    [invoices],
  );
  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.status === 'active' || s.status === 'trial'),
    [subscriptions],
  );

  const loadingAny = plansLoading || invoicesLoading || subsLoading;
  const anyError = plansError || invoicesError || subsError;

  const beginEditSelectedPlan = () => {
    if (!selectedPlan) return;
    const limits = (selectedPlan.limits ?? {}) as Record<string, unknown>;
    const areas =
      limits.areas && typeof limits.areas === 'object'
        ? (limits.areas as Record<string, unknown>)
        : {};
    setSaveError(null);
    setPlanForm({
      name: selectedPlan.name,
      description: selectedPlan.description,
      monthlyPriceInr: selectedPlan.monthlyPriceInr,
      trialDays: selectedPlan.trialDays,
      isActive: selectedPlan.isActive,
      isPopular: selectedPlan.isPopular,
      featuresText: selectedPlan.features.join('\n'),
      areaCore: typeof areas.core === 'string' ? areas.core : '',
      areaEvents: typeof areas.events === 'string' ? areas.events : '',
      areaStorage: typeof areas.storage === 'string' ? areas.storage : '',
      areaUsers: typeof areas.users === 'string' ? areas.users : '',
      areaRegistrations: typeof areas.registrations === 'string' ? areas.registrations : '',
      areaSponsorsAds: typeof areas.sponsors_ads === 'string' ? areas.sponsors_ads : '',
    });
    setIsEditingPlan(true);
  };

  const cancelEditSelectedPlan = () => {
    setIsEditingPlan(false);
    setSaveError(null);
    setPlanForm(null);
  };

  const saveSelectedPlan = async () => {
    if (!selectedPlan || !planForm) return;
    setSavingPlan(true);
    setSaveError(null);
    const features = planForm.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    const nextLimits = {
      ...((selectedPlan.limits ?? {}) as Record<string, unknown>),
      areas: {
        core: planForm.areaCore.trim(),
        events: planForm.areaEvents.trim(),
        storage: planForm.areaStorage.trim(),
        users: planForm.areaUsers.trim(),
        registrations: planForm.areaRegistrations.trim(),
        sponsors_ads: planForm.areaSponsorsAds.trim(),
      },
    };
    const { error } = await supabase
      .from('vendor_subscription_plans')
      .update({
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        monthly_price_inr: Math.max(0, Math.round(planForm.monthlyPriceInr)),
        trial_days: Math.max(0, Math.round(planForm.trialDays)),
        is_active: planForm.isActive,
        is_popular: planForm.isPopular,
        features,
        limits: nextLimits,
      })
      .eq('id', selectedPlan.id);
    if (error) {
      setSaveError(error.message);
      setSavingPlan(false);
      return;
    }
    await refetchPlans();
    setSelectedPlan((prev) =>
      prev
        ? {
            ...prev,
            name: planForm.name.trim(),
            description: planForm.description.trim(),
            monthlyPriceInr: Math.max(0, Math.round(planForm.monthlyPriceInr)),
            trialDays: Math.max(0, Math.round(planForm.trialDays)),
            isActive: planForm.isActive,
            isPopular: planForm.isPopular,
            features,
            limits: nextLimits as Record<string, unknown>,
          }
        : null,
    );
    setSavingPlan(false);
    setIsEditingPlan(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Plans & Billing</h1>
          <p className="text-gray-600">Vendor subscription plans and billing from database</p>
        </div>
        <Link to="/billing/plans/create">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Plan</span>
          </Button>
        </Link>
      </div>

      {anyError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load billing data: {anyError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{pendingAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{overdueAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{activeSubscriptions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'plans' as TabId, label: 'Subscription Plans', count: plans.length },
            { id: 'invoices' as TabId, label: 'Invoices', count: invoices.length },
            { id: 'subscriptions' as TabId, label: 'Subscriptions', count: activeSubscriptions.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{tab.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {loadingAny ? (
        <div className="text-sm text-gray-500">Loading billing data...</div>
      ) : (
        <>
          {activeTab === 'plans' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.isPopular ? 'ring-2 ring-blue-500' : ''}`}>
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 mt-1">{plan.description}</p>
                      <div className="mt-3">
                        <span className="text-4xl font-bold text-gray-900">₹{plan.monthlyPriceInr.toLocaleString()}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      {plan.trialDays > 0 && (
                        <p className="text-xs text-green-700 mt-1">{plan.trialDays} day trial</p>
                      )}
                    </div>

                    <ul className="space-y-2 mb-3">
                      {plan.features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-2.5">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Plan Areas</p>
                      <div className="space-y-1">
                        {getPlanAreaRows(plan as BillingPlan)
                          .slice(0, 4)
                          .map((row, i) => (
                            <div key={i} className="text-xs flex justify-between gap-2">
                              <span className="text-gray-600">{row.area}</span>
                              <span className="text-gray-900 font-medium text-right">{row.value}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={plan.isActive ? 'success' : 'default'}>
                        {plan.isActive ? 'active' : 'inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPlan(plan as BillingPlan)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'invoices' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.organizationName}</TableCell>
                        <TableCell>{inv.planName}</TableCell>
                        <TableCell>₹{inv.amountInr.toLocaleString()}</TableCell>
                        <TableCell>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(inv.status)}>{inv.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'subscriptions' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Vendor Subscriptions</h3>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Monthly</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.organizationName}</TableCell>
                        <TableCell>{sub.planName}</TableCell>
                        <TableCell>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>₹{sub.monthlyAmountInr.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(sub.status)}>{sub.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h2>
              <button onClick={() => setSelectedPlan(null)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {isEditingPlan && planForm ? (
                <div className="space-y-4">
                  {saveError && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      Failed to save plan: {saveError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan name</label>
                      <input
                        value={planForm.name}
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly price (INR)</label>
                      <input
                        type="number"
                        value={planForm.monthlyPriceInr}
                        onChange={(e) =>
                          setPlanForm({ ...planForm, monthlyPriceInr: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trial days</label>
                      <input
                        type="number"
                        value={planForm.trialDays}
                        onChange={(e) => setPlanForm({ ...planForm, trialDays: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <label className="inline-flex items-center gap-2 mt-7">
                      <input
                        type="checkbox"
                        checked={planForm.isActive}
                        onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="inline-flex items-center gap-2 mt-7">
                      <input
                        type="checkbox"
                        checked={planForm.isPopular}
                        onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Popular</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                    <textarea
                      rows={6}
                      value={planForm.featuresText}
                      onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Areas</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Core</label>
                        <textarea
                          rows={2}
                          value={planForm.areaCore}
                          onChange={(e) => setPlanForm({ ...planForm, areaCore: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Events</label>
                        <textarea
                          rows={2}
                          value={planForm.areaEvents}
                          onChange={(e) => setPlanForm({ ...planForm, areaEvents: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Storage</label>
                        <textarea
                          rows={2}
                          value={planForm.areaStorage}
                          onChange={(e) => setPlanForm({ ...planForm, areaStorage: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Users</label>
                        <textarea
                          rows={2}
                          value={planForm.areaUsers}
                          onChange={(e) => setPlanForm({ ...planForm, areaUsers: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Registrations</label>
                        <textarea
                          rows={2}
                          value={planForm.areaRegistrations}
                          onChange={(e) => setPlanForm({ ...planForm, areaRegistrations: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Sponsors & Ads</label>
                        <textarea
                          rows={2}
                          value={planForm.areaSponsorsAds}
                          onChange={(e) => setPlanForm({ ...planForm, areaSponsorsAds: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      ₹{selectedPlan.monthlyPriceInr.toLocaleString()}<span className="text-lg text-gray-600">/month</span>
                    </div>
                    <p className="text-gray-600 mt-1">{selectedPlan.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((f, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Plan Area Details</h4>
                <div className="rounded-md border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Area</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-700">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPlanAreaRows(selectedPlan).map((row, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-3 py-2 font-medium text-gray-800">{row.area}</td>
                          <td className="px-3 py-2 text-gray-700">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {isEditingPlan ? (
                  <>
                    <Button variant="outline" onClick={cancelEditSelectedPlan}>
                      Cancel
                    </Button>
                    <Button onClick={saveSelectedPlan} disabled={savingPlan}>
                      {savingPlan ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={beginEditSelectedPlan} className="inline-flex items-center gap-1">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                      Close
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

