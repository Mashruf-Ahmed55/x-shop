'use server';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/verify-forgot-password-user`,
      body
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message:
          error?.response?.data?.message ||
          'Verification failed to reset password',
      },
      { status: error?.response?.status || 500 }
    );
  }
}
