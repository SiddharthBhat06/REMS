import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Extract data from the request
    const { email, fullName, propertyName } = await req.json();

    if (!email || !propertyName) {
      throw new Error("Missing required fields: email or propertyName");
    }

    // 3. Call Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EstateHub <onboarding@resend.dev>",
        to: [email],
        subject: "Property Update: " + propertyName,
        html: `<strong>Hi ${fullName || 'there'},</strong><br><br>
               The property <strong>"${propertyName}"</strong> has been added! 
               Check out the latest details on the portal.`,
      }),
    });

    const resData = await res.json();

    return new Response(JSON.stringify(resData), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});