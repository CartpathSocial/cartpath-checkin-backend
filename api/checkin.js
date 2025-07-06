import { GoogleSpreadsheet } from 'google-spreadsheet';
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { fullName, email, phone, firstVisit, agreeWaiver } = req.body;
  if (!agreeWaiver || !email || !fullName || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    import { GoogleSpreadsheet } from 'google-spreadsheet';
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
@@ -21,15 +43,22 @@
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      Name: fullName,
      Timestamp: new Date().toLocaleString(),
      FullName: fullName,
      Email: email,
      Phone: phone,
      FirstVisit: firstVisit ? 'Yes' : 'No',
      CheckInDate: new Date().toLocaleString(),
    });
      WaiverSigned: agreeWaiver ? 'Yes' : 'No',
  });
    res.status(200).json({ success: true, message: 'Check-in successful!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
    res.status(200).json({ success: true, message: 'Check-in successful!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
