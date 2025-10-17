const BASE_URL = 'https://cartpath-checkin-backend.vercel.app';
const CHECKIN_PATH = '/api/checkin';

async function probeCheckinEndpoint() {
  const url = `${BASE_URL}${CHECKIN_PATH}`;
  console.log(`Probing ${url} ...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain;q=0.9',
      },
    });

    console.log(`Status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`Received non-OK status code: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response JSON:', data);
      if (data?.message !== 'Check-in API is live!') {
        throw new Error('Unexpected JSON response from check-in API');
      }
      console.log('✅ Check-in API responded with expected heartbeat message.');
    } else {
      const text = await response.text();
      console.log('Response Text:', text);
      if (text.trim() !== 'Check-in API is live!') {
        throw new Error('Unexpected response from check-in API');
      }
      console.log('✅ Check-in API responded with expected heartbeat message.');
    }
  } catch (error) {
    console.error('Failed to reach the check-in endpoint:', error);
    process.exitCode = 1;
  }
}

probeCheckinEndpoint();
