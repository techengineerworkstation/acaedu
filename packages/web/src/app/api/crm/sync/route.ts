import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

// CRM provider configurations
const CRM_CONFIGS = {
  hubspot: {
    baseUrl: 'https://api.hubapi.com',
    getHeaders: () => ({
      'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json'
    })
  },
  salesforce: {
    baseUrl: process.env.SALESFORCE_INSTANCE_URL || '',
    getHeaders: () => ({
      'Authorization': `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    })
  },
  zendesk: {
    baseUrl: `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2`,
    getHeaders: () => ({
      'Authorization': `Basic ${Buffer.from(`${process.env.ZENDESK_EMAIL}/token:${process.env.ZENDESK_API_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/json'
    })
  }
};

// Sync a user to CRM
async function syncToHubSpot(user: any, subscription: any) {
  const config = CRM_CONFIGS.hubspot;
  const response = await fetch(`${config.baseUrl}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: config.getHeaders(),
    body: JSON.stringify({
      properties: {
        email: user.email,
        firstname: user.full_name?.split(' ')[0] || '',
        lastname: user.full_name?.split(' ').slice(1).join(' ') || '',
        phone: user.phone || '',
        acadion_role: user.role,
        acadion_plan: subscription?.plan_id || 'free',
        acadion_subscription_status: subscription?.status || 'none',
        acadion_user_id: user.id
      }
    })
  });

  if (!response.ok) {
    // Try update if create fails (contact exists)
    const searchRes = await fetch(`${config.baseUrl}/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: config.getHeaders(),
      body: JSON.stringify({
        filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: user.email }] }]
      })
    });
    const searchData = await searchRes.json();
    if (searchData.results?.[0]) {
      await fetch(`${config.baseUrl}/crm/v3/objects/contacts/${searchData.results[0].id}`, {
        method: 'PATCH',
        headers: config.getHeaders(),
        body: JSON.stringify({
          properties: {
            acadion_plan: subscription?.plan_id || 'free',
            acadion_subscription_status: subscription?.status || 'none'
          }
        })
      });
      return searchData.results[0].id;
    }
  }

  const data = await response.json();
  return data.id;
}

async function syncToSalesforce(user: any, subscription: any) {
  const config = CRM_CONFIGS.salesforce;
  const response = await fetch(`${config.baseUrl}/services/data/v59.0/sobjects/Contact/`, {
    method: 'POST',
    headers: config.getHeaders(),
    body: JSON.stringify({
      Email: user.email,
      FirstName: user.full_name?.split(' ')[0] || '',
      LastName: user.full_name?.split(' ').slice(1).join(' ') || 'Unknown',
      Phone: user.phone || '',
      Description: `Acaedu ${user.role} - Plan: ${subscription?.plan_id || 'free'}`
    })
  });
  const data = await response.json();
  return data.id;
}

async function syncToZendesk(user: any, subscription: any) {
  const config = CRM_CONFIGS.zendesk;
  const response = await fetch(`${config.baseUrl}/users/create_or_update`, {
    method: 'POST',
    headers: config.getHeaders(),
    body: JSON.stringify({
      user: {
        email: user.email,
        name: user.full_name,
        phone: user.phone || '',
        role: 'end-user',
        user_fields: {
          acadion_role: user.role,
          acadion_plan: subscription?.plan_id || 'free'
        }
      }
    })
  });
  const data = await response.json();
  return data.user?.id;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) return authResult;

    const body = await req.json();
    const { provider, user_ids } = body;

    if (!provider || !['hubspot', 'salesforce', 'zendesk'].includes(provider)) {
      return NextResponse.json({ success: false, error: 'Valid provider required (hubspot, salesforce, zendesk)' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get users to sync
    let query = supabase.from('users').select('*');
    if (user_ids && Array.isArray(user_ids)) {
      query = query.in('id', user_ids);
    }
    const { data: users } = await query;

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'No users to sync' }, { status: 404 });
    }

    const results = [];
    for (const user of users) {
      try {
        // Get subscription
        const { data: subscription } = await supabase
          .from('billing_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        let externalId;
        switch (provider) {
          case 'hubspot': externalId = await syncToHubSpot(user, subscription); break;
          case 'salesforce': externalId = await syncToSalesforce(user, subscription); break;
          case 'zendesk': externalId = await syncToZendesk(user, subscription); break;
        }

        // Record sync
        await supabase.from('crm_sync').upsert({
          user_id: user.id,
          provider,
          external_id: externalId?.toString(),
          sync_type: 'contact',
          last_synced_at: new Date().toISOString(),
          sync_data: { plan: subscription?.plan_id || 'free', status: subscription?.status || 'none' }
        }, { onConflict: 'user_id,provider' });

        results.push({ user_id: user.id, status: 'success', external_id: externalId });
      } catch (err: any) {
        results.push({ user_id: user.id, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      data: { synced: results.filter(r => r.status === 'success').length, failed: results.filter(r => r.status === 'error').length, details: results }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'CRM sync failed' }, { status: 500 });
  }
}

// Get sync status
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireRole(req, ['admin']);
    if (!('user' in authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');

    const supabase = await createClient();
    let query = supabase.from('crm_sync').select('*, user:users (id, full_name, email, role)').order('last_synced_at', { ascending: false });

    if (provider) query = query.eq('provider', provider);

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch sync status' }, { status: 500 });
  }
}
