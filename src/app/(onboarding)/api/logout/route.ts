import { NextRequest, NextResponse } from 'next/server';
import { userStore } from '@/app/utils/userStore';

export async function POST(request: NextRequest) {
  try {
    // Get the session token from cookies
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 400 }
      );
    }

    // Delete the session from the store
    userStore.deleteSession(sessionToken);

    // Create response with cleared session cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the session token cookie
    response.cookies.set('session_token', '', {
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Also support GET for convenience (browser navigation)
  return POST(request);
}
