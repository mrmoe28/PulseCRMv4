import { NextRequest, NextResponse } from 'next/server';
import { tokenStorage } from '@/lib/api/tokenStorage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { organizationId, apiKey, testMode = false } = body;
    
    if (!organizationId || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate the API key by making a test request to Stripe
    try {
      // Try to load Stripe module if available
      let stripe;
      try {
        const stripeModule = await import('stripe');
        stripe = new stripeModule.default(apiKey);
      } catch (importError) {
        // Stripe module not installed, do basic validation
        console.log('Stripe module not installed, using basic validation');
        
        // Basic API key format validation
        if (!apiKey.startsWith('sk_test_') && !apiKey.startsWith('sk_live_')) {
          return NextResponse.json(
            { error: 'Invalid Stripe API key format' },
            { status: 400 }
          );
        }
        
        // Store without validation if Stripe module not available
        const tokenKey = `${organizationId}_stripe`;
        tokenStorage.set(tokenKey, {
          apiKey: Buffer.from(apiKey).toString('base64'),
          testMode: apiKey.startsWith('sk_test_'),
          connectedAt: new Date().toISOString(),
          validated: false,
        });
        
        return NextResponse.json({
          success: true,
          message: 'Stripe API key stored (validation pending)',
          account: {
            testMode: apiKey.startsWith('sk_test_'),
          },
        });
      }
      
      // If Stripe module is available, validate properly
      const account = await stripe.accounts.retrieve();
      
      // Store the API key (encrypted in production)
      const tokenKey = `${organizationId}_stripe`;
      tokenStorage.set(tokenKey, {
        apiKey: Buffer.from(apiKey).toString('base64'),
        testMode,
        connectedAt: new Date().toISOString(),
        accountId: account.id,
        accountName: account.business_profile?.name || account.email,
        country: account.country,
        currency: account.default_currency,
      });
      
      return NextResponse.json({
        success: true,
        message: 'Stripe connected successfully',
        account: {
          id: account.id,
          name: account.business_profile?.name || account.email,
          country: account.country,
        },
      });
    } catch (stripeError: any) {
      console.error('Stripe API key validation failed:', stripeError);
      
      // Check if it's an authentication error
      if (stripeError.type === 'StripeAuthenticationError') {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: stripeError.message || 'Failed to validate Stripe API key' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Stripe connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect Stripe' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing organizationId' },
        { status: 400 }
      );
    }
    
    // Remove stored API key
    const tokenKey = `${organizationId}_stripe`;
    tokenStorage.delete(tokenKey);
    
    return NextResponse.json({
      success: true,
      message: 'Stripe disconnected successfully',
    });
  } catch (error) {
    console.error('Stripe disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Stripe' },
      { status: 500 }
    );
  }
}