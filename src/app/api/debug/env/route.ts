import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow this in development or with a secret key
  const debugKey = request.nextUrl.searchParams.get('key');
  if (process.env.NODE_ENV === 'production' && debugKey !== 'debug123') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    NEXT_PUBLIC_AZURE_CLIENT_ID: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ? 'SET' : 'MISSING',
    NEXT_PUBLIC_AZURE_TENANT_ID: process.env.NEXT_PUBLIC_AZURE_TENANT_ID ? 'SET' : 'MISSING',
    NEXT_PUBLIC_AZURE_AUTHORITY: process.env.NEXT_PUBLIC_AZURE_AUTHORITY ? 'SET' : 'MISSING',
    NEXT_PUBLIC_AZURE_REDIRECT_URI: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ? 'SET' : 'MISSING',
  };

  return NextResponse.json(envVars);
}
