'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/supabase/session';
import { useTheme } from '@/contexts/ThemeContext';
import { InstitutionSettings, THEME_PRESETS } from '@/lib/theme';
import Button from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { typedSupabase } from '@/lib/supabase/client';
import { Upload, Palette, Globe, Phone, MapPin, Save, CreditCard, Plus, Trash2, Edit, AlertTriangle, Database } from 'lucide-react';

interface SubscriptionPlan {
  id?: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency_code: string;
  max_users: number;
  features: string[];
  is_active: boolean;
  is_default?: boolean;
}

const commonCurrencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'XOF', name: 'West African CFA franc', symbol: 'CFA' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
];

export default function AdminSettingsPage() {
  const { user } = useSession();
  const { settings, updateSettings, currentColors, setThemePreset } = useTheme();
  const [formData, setFormData] = useState<Partial<InstitutionSettings>>({});
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Sample data management state
  const [sampleCounts, setSampleCounts] = useState<Record<string, number>>({});
  const [totalSampleCount, setTotalSampleCount] = useState(0);
  const [isCheckingSamples, setIsCheckingSamples] = useState(false);
  const [isDeletingSamples, setIsDeletingSamples] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
    fetchPlans();
    fetchSampleCounts();
  }, [settings]);

  const fetchSampleCounts = async () => {
    setIsCheckingSamples(true);
    try {
      const { data: { session } } = await typedSupabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/admin/sample-data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json();
      if (result.success) {
        setSampleCounts(result.data.counts);
        setTotalSampleCount(result.data.total);
      }
    } catch (e) {
      console.error('Failed to fetch sample counts:', e);
    } finally {
      setIsCheckingSamples(false);
    }
  };

  const handleDeleteSampleData = async () => {
    if (!confirm('Are you sure you want to delete ALL sample data? This cannot be undone.')) return;
    if (!confirm('This will permanently delete all sample records including users, courses, enrollments, etc. Continue?')) return;

    setIsDeletingSamples(true);
    try {
const { data: { session } } = await typedSupabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('/api/admin/sample-data', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json();

      if (result.success) {
        toast.success(`Deleted ${result.data.totalDeleted} sample records.`);
        // Refresh counts
        await fetchSampleCounts();
      } else {
        toast.error(result.error || 'Failed to delete sample data');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsDeletingSamples(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await typedSupabase
        .from('subscription_plans')
        .select('*')
        .eq('institution_id', '00000000-0000-0000-0000-000000000001')
        .order('price_monthly', { ascending: true });
      if (data) setPlans(data);
    } catch (e) {
      console.error('Failed to fetch plans:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await updateSettings(formData);
      if (result.error) {
        toast.error(`Failed to save: ${result.error}`);
      } else {
        toast.success('Settings saved successfully!');
      }
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async (plan: SubscriptionPlan) => {
    setIsLoading(true);
    try {
      const supabase = typedSupabase;
      const planData = {
        ...plan,
        institution_id: '00000000-0000-0000-0000-000000000001',
      };

      const { error } = plan.id
        ? await supabase.from('subscription_plans').update(planData).eq('id', plan.id)
        : await supabase.from('subscription_plans').insert(planData);

      if (error) throw error;
      toast.success(`Plan ${plan.id ? 'updated' : 'created'} successfully!`);
      setShowPlanModal(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Delete this plan? This cannot be undone.')) return;
    try {
      const { error } = await typedSupabase.from('subscription_plans').delete().eq('id', id);
      if (error) throw error;
      toast.success('Plan deleted');
      fetchPlans();
    } catch (e) {
      toast.error('Failed to delete plan');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access this page.</p>
</div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Institution Settings</h1>
          <p className="text-gray-600 mt-2">
            Customize branding, currency, and subscription plans
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Basic Info & Theme */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-5 w-5 text-primary-500 mr-2" />
                <h2 className="text-lg font-semibold">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={formData.institution_name || ''}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motto / Tagline</label>
                  <input
                    type="text"
                    value={formData.motto || ''}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={formData.logo_url || ''}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                  <input
                    type="url"
                    value={formData.favicon_url || ''}
                    onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={formData.website_url || ''}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={formData.facebook_url || ''}
                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                  <input
                    type="url"
                    value={formData.twitter_url || ''}
                    onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={formData.instagram_url || ''}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={formData.support_email || ''}
                    onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Theme & Colors */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Palette className="h-5 w-5 text-primary-500 mr-2" />
                <h2 className="text-lg font-semibold">Theme & Colors</h2>
              </div>
              <div className="space-y-6">
                {/* Theme Preset */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme Preset</label>
                  <select
                    value={formData.theme_preset || 'turquoise'}
                    onChange={(e) => {
                      const preset = e.target.value;
                      const colors = THEME_PRESETS[preset] || THEME_PRESETS.turquoise;
                      setFormData({
                        ...formData,
                        theme_preset: preset,
                        primary_color: colors.primary,
                        secondary_color: colors.secondary,
                        accent_color: colors.accent,
                        background_color: colors.background,
                        surface_color: colors.surface,
                        text_primary_color: colors.textPrimary,
                        text_secondary_color: colors.textSecondary,
                      });
                      // Apply live theme as well
                      setThemePreset(preset);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.keys(THEME_PRESETS).map((preset) => (
                      <option key={preset} value={preset}>
                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select a preset to automatically configure colors.</p>
                </div>

                {/* Color Picker Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Primary Color', key: 'primary_color', default: '#0ea5e9' },
                    { label: 'Secondary Color', key: 'secondary_color', default: '#6366f1' },
                    { label: 'Accent Color', key: 'accent_color', default: '#f59e0b' },
                    { label: 'Background Color', key: 'background_color', default: '#ffffff' },
                    { label: 'Surface Color', key: 'surface_color', default: '#f8fafc' },
                    { label: 'Text Primary Color', key: 'text_primary_color', default: '#1e293b' },
                    { label: 'Text Secondary Color', key: 'text_secondary_color', default: '#64748b' },
                  ].map((colorField) => (
                    <div key={colorField.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{colorField.label}</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData[colorField.key as keyof InstitutionSettings] || colorField.default}
                          onChange={(e) => setFormData({ ...formData, [colorField.key]: e.target.value })}
                          className="h-10 w-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData[colorField.key as keyof InstitutionSettings] || colorField.default}
                          onChange={(e) => setFormData({ ...formData, [colorField.key]: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder={colorField.default}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Billing & Currency */}
          <div className="lg:col-span-1 space-y-8">
            {/* Currency Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 text-primary-500 mr-2" />
                <h2 className="text-lg font-semibold">Currency & Billing</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Currency
                  </label>
                  <select
                    value={formData.default_currency_code || 'NGN'}
                    onChange={(e) => setFormData({ ...formData, default_currency_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {commonCurrencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name} ({curr.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (VAT) (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.tax_rate || 0}
                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Subscription Plans</h2>
                <Button
                  size="sm"
                  onClick={() => { setEditingPlan(null); setShowPlanModal(true); }}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Plan
                </Button>
              </div>

              <div className="space-y-3">
                {plans.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No plans defined</p>
                ) : (
                  plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-3 border rounded-lg ${plan.is_default ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{plan.name}</p>
                          <p className="text-xs text-gray-500">
                            {plan.currency_code} {plan.price_monthly}/mo
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => { setEditingPlan(plan); setShowPlanModal(true); }}
                            className="p-1 text-gray-500 hover:text-primary-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => plan.id && handleDeletePlan(plan.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {plan.is_default && (
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded mt-2 inline-block">
                          Default
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sample Data Management */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 text-primary-500 mr-2" />
            <h2 className="text-lg font-semibold">Sample Data</h2>
          </div>

          {totalSampleCount === 0 ? (
            <p className="text-sm text-gray-500">No sample data exists in the database.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                The following sample records are currently in the database. You can delete them all at once.
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Total Sample Records</span>
                  <span className="text-xl font-bold text-primary-600">{totalSampleCount}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(sampleCounts)
                    .filter(([_, count]) => count > 0)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([table, count]) => (
                      <div key={table} className="flex justify-between bg-white px-2 py-1 rounded">
                        <span className="capitalize">{table.replace(/_/g, ' ')}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <Button
                variant="danger"
                onClick={handleDeleteSampleData}
                isLoading={isDeletingSamples}
                disabled={totalSampleCount === 0}
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="w-full"
              >
                Delete All Sample Data
              </Button>

              <p className="text-xs text-gray-500">
                This will permanently delete all sample users, courses, schedules, announcements, events, subscription plans, and related data. Real data will not be affected.
              </p>
            </div>
          )}

          {totalSampleCount > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
              <p className="text-xs text-yellow-800">
                Sample data is meant for testing and demonstration. Remember to delete it before launching to production.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <Button type="submit" onClick={handleSubmit} isLoading={isLoading} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </Button>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <PlanModal
          plan={editingPlan}
          currencies={commonCurrencies}
          defaultCurrency={formData.default_currency_code || 'NGN'}
          onSave={handleSavePlan}
          onClose={() => { setShowPlanModal(false); setEditingPlan(null); }}
        />
      )}
    </div>
  );
}

// Plan Modal Component
function PlanModal({
  plan,
  currencies,
  defaultCurrency,
  onSave,
  onClose,
  isLoading = false
}: {
  plan: SubscriptionPlan | null;
  currencies: { code: string; name: string; symbol: string }[];
  defaultCurrency: string;
  onSave: (plan: SubscriptionPlan) => void;
  onClose: () => void;
  isLoading?: boolean;
}) {
  const [form, setForm] = useState<SubscriptionPlan>({
    name: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    currency_code: defaultCurrency,
    max_users: 100,
    features: [],
    is_active: true,
    is_default: false,
    ...plan,
  });

  const [featureInput, setFeatureInput] = useState('');

  const addFeature = () => {
    if (featureInput.trim() && !form.features.includes(featureInput.trim())) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{plan ? 'Edit Plan' : 'Create New Plan'}</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Basic, Premium, Enterprise"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={form.currency_code}
                  onChange={(e) => setForm({ ...form, currency_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="Brief description of this plan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price_monthly}
                  onChange={(e) => setForm({ ...form, price_monthly: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price_yearly}
                  onChange={(e) => setForm({ ...form, price_yearly: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Users</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_users}
                  onChange={(e) => setForm({ ...form, max_users: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center space-x-4 pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="ml-2 text-sm">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="ml-2 text-sm">Default</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
              <textarea
                value={form.features.join('\n')}
                onChange={(e) => setForm({ ...form, features: e.target.value.split('\n').filter(f => f.trim()) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Unlimited courses&#10;24/7 support&#10;Advanced analytics"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave(form)} isLoading={isLoading}>
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
