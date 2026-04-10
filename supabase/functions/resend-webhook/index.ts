import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, svix-id, svix-timestamp, svix-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const body = await req.json();
    console.log('Resend webhook event:', JSON.stringify(body));

    const { type, data } = body;

    if (!data?.email_id) {
      return new Response(JSON.stringify({ received: true, skipped: 'no email_id' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendEmailId = data.email_id;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (type) {
      case 'email.sent':
        updates.status = 'sent';
        break;
      case 'email.delivered':
        updates.status = 'delivered';
        updates.delivered_at = data.created_at || new Date().toISOString();
        // Update associated order status to completed when email is delivered
        {
          const { data: emailLog } = await supabase
            .from('email_logs')
            .select('order_id')
            .eq('resend_email_id', resendEmailId)
            .maybeSingle();

          if (emailLog?.order_id) {
            const { error: orderError } = await supabase
              .from('orders')
              .update({ status: 'completed' })
              .eq('id', emailLog.order_id);
            if (orderError) {
              console.error('Failed to update order status:', orderError);
            } else {
              console.log(`Order ${emailLog.order_id} marked as completed`);
            }
          }
        }
        break;
      case 'email.bounced':
        updates.status = 'bounced';
        updates.bounced_at = data.created_at || new Date().toISOString();
        updates.bounce_reason = data.bounce?.message || data.reason || 'Unknown bounce';
        break;
      case 'email.delivery_delayed':
        updates.status = 'delayed';
        break;
      case 'email.complained':
        updates.status = 'complained';
        break;
      default:
        console.log('Unhandled event type:', type);
        return new Response(JSON.stringify({ received: true, skipped: type }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const { error } = await supabase
      .from('email_logs')
      .update(updates)
      .eq('resend_email_id', resendEmailId);

    if (error) {
      console.error('Failed to update email_logs:', error);
    } else {
      console.log(`Updated email_logs for ${resendEmailId} to status: ${updates.status}`);
    }

    return new Response(JSON.stringify({ received: true, status: updates.status }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
