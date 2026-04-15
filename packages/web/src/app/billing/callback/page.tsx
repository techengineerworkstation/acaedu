'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/button';

function BillingCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const provider = searchParams.get('provider');
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const subscriptionId = searchParams.get('subscription_id');

  useEffect(() => {
    async function verifyPayment() {
      try {
        if (provider === 'paystack' && reference) {
          const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`);
          if (res.ok) {
            setStatus('success');
          } else {
            setStatus('error');
          }
        } else if (provider === 'paypal' && subscriptionId) {
          setStatus('success');
        } else {
          setStatus('success'); // Assume success if callback was reached
        }
      } catch {
        setStatus('error');
      }
    }
    verifyPayment();
  }, [provider, reference, subscriptionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900">Verifying payment...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your subscription.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-500 mt-2">Your subscription has been activated. Enjoy your premium features!</p>
            <Button className="mt-6 w-full" onClick={() => router.push('/student/dashboard')}>
              Go to Dashboard
            </Button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-500 mt-2">Something went wrong with your payment. Please try again.</p>
            <Button className="mt-6 w-full" onClick={() => router.push('/student/billing')}>
              Try Again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    }>
      <BillingCallbackContent />
    </Suspense>
  );
}
