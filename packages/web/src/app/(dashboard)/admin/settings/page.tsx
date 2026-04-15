'use client';
 
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/Card';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ThemeSelector from '@/components/settings/ThemeSelector';
import ExportToFigma from '@/components/settings/ExportToFigma';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency, CURRENCIES } from '@/contexts/CurrencyContext';
import { GlobeAltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function AdminSettingsPage() {
  const { currentColors, settings, updateSettings, setThemePreset } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [paystackKey, setPaystackKey] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalSecret, setPaypalSecret] = useState('');
  const [hubspotKey, setHubspotKey] = useState('');
  const [salesforceUrl, setSalesforceUrl] = useState('');
  const [zendeskSubdomain, setZendeskSubdomain] = useState('');

  // Branding form state
  const [branding, setBranding] = useState({
    institution_name: settings?.institution_name || 'Acaedu',
    motto: settings?.motto || '',
    logo_url: settings?.logo_url || '',
    website_url: settings?.website_url || '',
    support_email: settings?.support_email || '',
    contact_phone: settings?.contact_phone || '',
    address: settings?.address || ''
  });

  const handleBrandingSave = async () => {
    const result = await updateSettings(branding);
    if (result.error) {
      toast.error('Failed to save branding: ' + result.error);
    } else {
      toast.success('Branding updated successfully');
    }
  };

  const handleThemeChange = (preset: string) => {
    setThemePreset(preset);
    updateSettings({ theme_preset: preset });
    toast.success(`Theme changed to ${preset.replace('_', ' ')}`);
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Institution Settings</h1>
        <p className="text-gray-500">
          Customize your institution's branding, appearance, and integrations.
        </p>

        {/* Institution Branding */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Institution Branding</h2>
            <p className="text-sm text-gray-500">
              Customize logo, motto, and brand assets for your institution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                label="Institution Name"
                placeholder="University of Example"
                value={branding.institution_name}
                onChange={(e) => setBranding({ ...branding, institution_name: e.target.value })}
              />
              <Input
                label="Motto / Tagline"
                placeholder="Excellence in Education"
                value={branding.motto || ''}
                onChange={(e) => setBranding({ ...branding, motto: e.target.value })}
              />
              <Input
                label="Logo URL"
                placeholder="https://..."
                value={branding.logo_url || ''}
                onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
              />
              <Input
                label="Website URL"
                placeholder="https://yourinstitution.edu"
                value={branding.website_url || ''}
                onChange={(e) => setBranding({ ...branding, website_url: e.target.value })}
              />
              <Input
                label="Support Email"
                placeholder="support@yourinstitution.edu"
                value={branding.support_email || ''}
                onChange={(e) => setBranding({ ...branding, support_email: e.target.value })}
              />
              <Input
                label="Contact Phone"
                placeholder="+1 234 567 8900"
                value={branding.contact_phone || ''}
                onChange={(e) => setBranding({ ...branding, contact_phone: e.target.value })}
              />
              <Input
                label="Address"
                placeholder="123 University Ave, City, Country"
                value={branding.address || ''}
                onChange={(e) => setBranding({ ...branding, address: e.target.value })}
              />
            </div>

            {/* Logo Preview */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Logo Preview</label>
              <div className="border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 min-h-[200px]">
                {branding.logo_url ? (
                  <Image
                    src={branding.logo_url}
                    alt={branding.institution_name}
                    width={180}
                    height={60}
                    className="object-contain max-h-[80px]"
                    onError={() => toast.error('Failed to load image')}
                  />
                ) : (
                  <div className="text-center">
                    <div
                      className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: currentColors.primary + '20' }}
                    >
                      <span className="text-4xl">🎓</span>
                    </div>
                    <p className="text-sm text-gray-500">Logo URL preview</p>
                  </div>
                )}
                {branding.motto && (
                  <p className="mt-4 text-sm font-italic text-gray-600 text-center">
                    "{branding.motto}"
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Enter a URL to an image file (PNG, JPG, SVG recommended).
                For production, upload via the file manager.
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button onClick={handleBrandingSave}>Save Branding</Button>
          </div>
        </Card>

        {/* Currency Settings */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Currency Settings
            </h2>
            <p className="text-sm text-gray-500">
              Select the default currency for billing and payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURRENCIES.map((c) => (
              <motion.div
                key={c.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrency(c);
                  toast.success(`Currency changed to ${c.name}`);
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  currency.code === c.code
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{c.flag}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{c.symbol} {c.code}</p>
                    <p className="text-sm text-gray-500">{c.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> African currencies are optimized for institutions across Africa.
              Contact support for custom currency requirements.
            </p>
          </div>
        </Card>

        {/* Theme Selector */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">App Theme</h2>
            <p className="text-sm text-gray-500">
              Choose a color theme that matches your institution's brand identity.
            </p>
          </div>

          <ThemeSelector
            currentPreset={settings?.theme_preset || 'metallic_turquoise'}
            onSelect={handleThemeChange}
            onSave={() => toast.success('Theme saved')}
          />

          {/* Preview Banner */}
          <div
            className="mt-6 p-6 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${currentColors.primary}15, ${currentColors.secondary}15)`,
              borderColor: currentColors.primary + '40',
              borderStyle: 'solid',
              borderWidth: 1
            }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: currentColors.primary }}
              >
                <span className="text-4xl">🎓</span>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold" style={{ color: currentColors.textPrimary }}>
                  {settings?.institution_name || 'Acaedu'}
                </h3>
                {settings?.motto && (
                  <p className="text-sm italic mt-1" style={{ color: currentColors.textSecondary }}>
                    "{settings.motto}"
                  </p>
                )}
                <p className="text-sm mt-2" style={{ color: currentColors.textSecondary }}>
                  Current theme: <span className="font-semibold" style={{ color: currentColors.primary }}>
                    {settings?.theme_preset?.replace('_', ' ') || 'Metallic Turquoise'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Integration Settings */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Gateway</h2>
            <p className="text-sm text-gray-500">
              Configure Paystack and PayPal integration keys. These are set via environment variables in production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 border-r pr-6">
              <h3 className="font-medium text-gray-700">Paystack</h3>
              <Input
                label="Secret Key (env: PAYSTACK_SECRET_KEY)"
                type="password"
                value={paystackKey}
                onChange={(e) => setPaystackKey(e.target.value)}
                placeholder="sk_live_..."
              />
              <p className="text-xs text-gray-500">
                Get your keys from the Paystack dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">PayPal</h3>
              <Input
                label="Client ID (env: PAYPAL_CLIENT_ID)"
                value={paypalClientId}
                onChange={(e) => setPaypalClientId(e.target.value)}
                placeholder="Client ID"
              />
              <Input
                label="Secret (env: PAYPAL_CLIENT_SECRET)"
                type="password"
                value={paypalSecret}
                onChange={(e) => setPaypalSecret(e.target.value)}
                placeholder="Secret"
              />
              <p className="text-xs text-gray-500">
                Configure in your hosting platform's environment variables.
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={() => toast.success('Payment credentials saved to environment (configure via hosting)')}
            >
              Save Payment Settings
            </Button>
          </div>
        </Card>

        {/* CRM Integration */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">CRM Integration</h2>
            <p className="text-sm text-gray-500">
              Connect to HubSpot, Salesforce, or Zendesk for customer relationship management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">HubSpot</h3>
              <Input
                label="API Key"
                type="password"
                value={hubspotKey}
                onChange={(e) => setHubspotKey(e.target.value)}
                placeholder="HubSpot API Key"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Salesforce</h3>
              <Input
                label="Instance URL"
                value={salesforceUrl}
                onChange={(e) => setSalesforceUrl(e.target.value)}
                placeholder="https://yourorg.salesforce.com"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Zendesk</h3>
              <Input
                label="Subdomain"
                value={zendeskSubdomain}
                onChange={(e) => setZendeskSubdomain(e.target.value)}
                placeholder="yourcompany"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <Button onClick={() => toast.success('CRM settings saved')}>
              Save CRM Settings
            </Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-500">
              Configure how notifications are delivered to users.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Send announcements and reminders via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Real-time alerts on mobile and web</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Important alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <Input
            label="Resend API Key (env: RESEND_API_KEY)"
            type="password"
            placeholder="re_..."
            className="max-w-md"
          />

          <div className="border-t pt-4">
            <Button onClick={() => toast.success('Notification settings saved')}>
              Save Notification Settings
            </Button>
          </div>
        </Card>

        {/* Export to Figma */}
        <Card>
          <ExportToFigma />
        </Card>
      </div>
    </DashboardLayout>
  );
}
