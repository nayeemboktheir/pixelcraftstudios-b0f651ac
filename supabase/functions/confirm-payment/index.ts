import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { order_number, customer_email, customer_name, product_name, total } = await req.json();

    if (!order_number || !customer_email) {
      return new Response(JSON.stringify({ error: 'Missing order_number or customer_email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    // 1) Update payment status to paid and order status to confirmed
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', status: 'confirmed' })
      .eq('order_number', order_number);

    if (updateError) {
      console.error('Payment status update failed:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update payment status' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Order ${order_number} payment confirmed`);

    // 2) Send digital delivery email
    const pdfDownloadUrl = 'https://pixelcraftstudio.shop/download?file=ai-prompt-mastery';
    const emailUrl = `${supabaseUrl}/functions/v1/send-digital-delivery-email`;
    
    try {
      const emailResp = await fetch(emailUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number,
          customer_name: customer_name || '',
          customer_email,
          download_link: pdfDownloadUrl,
          product_name: product_name || 'AI Prompt Mastery (PDF)',
          total: total || 0,
        }),
      });
      const emailResult = await emailResp.json();
      console.log('Delivery email response:', JSON.stringify(emailResult));
    } catch (emailErr) {
      console.error('Failed to send delivery email:', emailErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('confirm-payment error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
