import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyId, pin, cardId, action } = await req.json();

    console.log(`[validate-pin] Validating PIN for company: ${companyId}, action: ${action}`);

    if (!companyId || !pin) {
      console.log('[validate-pin] Missing required fields');
      return new Response(
        JSON.stringify({ valid: false, error: 'companyId e pin são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      console.log('[validate-pin] Invalid PIN format');
      return new Response(
        JSON.stringify({ valid: false, error: 'PIN deve ter 4 dígitos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role to access pin_secret
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Fetch company with pin_secret using service role (bypasses RLS)
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, pin_secret')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('[validate-pin] Company not found:', companyError);
      return new Response(
        JSON.stringify({ valid: false, error: 'Empresa não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate PIN
    const isValid = company.pin_secret === pin;

    console.log(`[validate-pin] PIN validation result: ${isValid}`);

    if (!isValid) {
      // Log failed attempt for security monitoring
      console.warn(`[validate-pin] Failed PIN attempt for company ${companyId}`);
      return new Response(
        JSON.stringify({ valid: false, error: 'PIN incorreto' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({ 
        valid: true, 
        message: 'PIN validado com sucesso' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[validate-pin] Error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
