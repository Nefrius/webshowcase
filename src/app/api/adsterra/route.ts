import { NextRequest, NextResponse } from 'next/server';

const ADSTERRA_API_BASE_URL = 'https://api3.adsterratools.com/publisher';
const API_TOKEN = process.env.ADSTERRA_API_TOKEN;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '/stats.json';
  
  // Remove endpoint from search params
  searchParams.delete('endpoint');
  
  if (!API_TOKEN) {
    return NextResponse.json(
      { error: 'Adsterra API token not configured' },
      { status: 500 }
    );
  }

  try {
    const url = `${ADSTERRA_API_BASE_URL}${endpoint}?${searchParams.toString()}`;
    
    console.log('Adsterra API Request:', {
      url,
      token: API_TOKEN ? 'Token exists' : 'No token',
      params: Object.fromEntries(searchParams)
    });
    
    // Try different authentication methods
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${API_TOKEN}`,
      'X-API-Key': API_TOKEN, // Adsterra typically uses X-API-Key
    };
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Adsterra API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        response: errorText
      });
      
      return NextResponse.json(
        { 
          error: `Adsterra API error: ${response.status}`,
          details: errorText,
          url: url
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Adsterra API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Adsterra API', details: String(error) },
      { status: 500 }
    );
  }
} 