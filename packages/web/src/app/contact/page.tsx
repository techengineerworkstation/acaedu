'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Would integrate with email service
    setTimeout(() => {
      toast.success('Message sent! We will get back to you shortly.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Contact Us</h1>
        <p className="text-gray-600 text-center mb-12">Have a question or need support? We&apos;d love to hear from you.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <EnvelopeIcon className="h-8 w-8 text-primary-500 mb-3" />
              <h3 className="font-semibold text-gray-900">Email</h3>
              <p className="text-gray-600 text-sm mt-1">support@acadion.com</p>
              <p className="text-gray-600 text-sm">info@acadion.com</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <PhoneIcon className="h-8 w-8 text-primary-500 mb-3" />
              <h3 className="font-semibold text-gray-900">Phone</h3>
              <p className="text-gray-600 text-sm mt-1">+1 (555) 123-4567</p>
              <p className="text-gray-600 text-sm">Mon-Fri, 9am-5pm</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <MapPinIcon className="h-8 w-8 text-primary-500 mb-3" />
              <h3 className="font-semibold text-gray-900">Office</h3>
              <p className="text-gray-600 text-sm mt-1">123 Academic Drive</p>
              <p className="text-gray-600 text-sm">Education City, EC 10001</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
              </div>
              <Input label="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" rows={6} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." />
              </div>
              <Button type="submit" className="w-full" isLoading={sending}>Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
