import { GoogleSpreadsheet } from 'google-spreadsheet';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Check-in API is live!' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parse JSON body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { fullName, email, phone, firstVisit, agreeWaiver } = body;

  const normalizedFirstVisit =
    firstVisit === true || firstVisit === 'true' || firstVisit === 'on';

  const normalizedAgreeWaiver =
    agreeWaiver === true || agreeWaiver === 'true' || agreeWaiver === 'on';

  if (!normalizedAgreeWaiver || !email || !fullName || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Timestamp: new Date().toLocaleString(),
      FullName: fullName,
      Email: email,
      Phone: phone,
      FirstVisit: normalizedFirstVisit ? 'Yes' : 'No',
      WaiverSigned: normalizedAgreeWaiver ? 'Yes' : 'No',
    });

    res.status(200).json({ success: true, message: 'Check-in successful!' });
  } catch (error) {
    console.error('Spreadsheet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
