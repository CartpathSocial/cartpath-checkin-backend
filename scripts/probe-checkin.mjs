const BASE_URL = 'https://cartpath-checkin-backend.vercel.app';
const CHECKIN_PATH = '/api/checkin';

async function probeCheckinEndpoint() {
  const url = `${BASE_URL}${CHECKIN_PATH}`;
  console.log(`Probing ${url} ...`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`Status: ${response.status}`);
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response JSON:', data);
    } else {
      const text = await response.text();
      console.log('Response Text:', text);
    }
  } catch (error) {
    console.error('Failed to reach the check-in endpoint:', error);
    process.exitCode = 1;
  }
}

probeCheckinEndpoint();
