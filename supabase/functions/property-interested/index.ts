import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers to allow browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Handle Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    // 2. Safely parse the body
    const { email, fullName, role } = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "REMs <onboarding@resend.dev>", // Use Resend's default or your verified domain
        to: email,
        subject: "Welcome to REMS 🏡",
        html: `
          <h2>Hi ${fullName},</h2>
          <p>Welcome to <strong>REMS</strong>!</p>
          <p>Your account has been created as a <strong>${role}</strong>.</p>
          <p>Start exploring properties today.</p>
          <br/><p>— The REMS Team</p>
        `,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error:any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});