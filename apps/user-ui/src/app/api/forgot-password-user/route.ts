'use server';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/forgot-password-user`,
      body
    );
    console.log(response.data);
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.response?.data?.message || 'Failed to send OTP.',
      },
      { status: error?.response?.status || 500 }
    );
  }
}
