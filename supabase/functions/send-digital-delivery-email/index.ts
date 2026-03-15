import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface DigitalDeliveryRequest {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  download_link: string;
  product_name: string;
  product_image?: string;
  total: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ success: false, message: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Fetch email settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('key', ['resend_api_key', 'shop_name', 'shop_logo_url']);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value;
    });

    if (!settingsMap.resend_api_key) {
      return new Response(JSON.stringify({ success: false, message: 'Resend API key not configured. Go to Shop Settings to add it.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: DigitalDeliveryRequest = await req.json();
    console.log('Sending digital delivery email for:', body.order_number, 'to:', body.customer_email);

    const resend = new Resend(settingsMap.resend_api_key);
    const shopName = settingsMap.shop_name || 'Our Store';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Digital Product is Ready!</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          ${settingsMap.shop_logo_url ? `<img src="${settingsMap.shop_logo_url}" alt="${shopName}" style="max-height: 50px; margin-bottom: 15px;" />` : ''}
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">🎉 আপনার প্রোডাক্ট রেডি!</h1>
          <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px;">Order #${body.order_number}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 16px; margin-top: 0;">প্রিয় <strong>${body.customer_name}</strong>,</p>
          <p style="color: #555;">আপনার অর্ডারের জন্য ধন্যবাদ! আপনার ডিজিটাল প্রোডাক্ট ডাউনলোডের জন্য প্রস্তুত।</p>
          
          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e9ecef;">
            <h3 style="margin: 0 0 10px; color: #1a1a2e;">📦 প্রোডাক্ট ডিটেইলস</h3>
            <p style="margin: 5px 0; font-size: 16px; font-weight: 600;">${body.product_name}</p>
            <p style="margin: 5px 0; color: #666;">মোট: ৳${body.total}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${body.download_link}" 
               style="display: inline-block; background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
              📥 ডাউনলোড করুন
            </a>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; font-size: 13px; color: #856404;">
              ⚠️ <strong>গুরুত্বপূর্ণ:</strong> এই ডাউনলোড লিংকটি শুধুমাত্র আপনার জন্য। অনুগ্রহ করে অন্যদের সাথে শেয়ার করবেন না।
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #888; font-size: 12px; border-radius: 0 0 16px 16px; background: white; border: 1px solid #e0e0e0; border-top: none;">
          <p style="margin: 0;">কোনো সমস্যা হলে আমাদের সাথে যোগাযোগ করুন।</p>
          <p style="margin: 5px 0 0; color: #aaa;">&copy; ${new Date().getFullYear()} ${shopName}</p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: `${shopName} <onboarding@resend.dev>`,
      to: [body.customer_email],
      subject: `🎉 আপনার প্রোডাক্ট রেডি - Order #${body.order_number}`,
      html: emailHtml,
    });

    console.log('Digital delivery email sent:', emailResponse);

    // Update order status to email_sent
    await supabase
      .from('orders')
      .update({ status: 'email_sent' })
      .eq('id', body.order_id);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error sending digital delivery email:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
