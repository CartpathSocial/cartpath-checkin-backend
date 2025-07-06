
const { Client } = require('square');
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullName, email, phone, firstVisit, agreeWaiver } = req.body;

    // Square
    const squareClient = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: 'production',
    });

    const customersApi = squareClient.customersApi;
    let customerId = null;

    try {
      const { result } = await customersApi.searchCustomers({
        query: { filter: { emailAddress: { exact: email } } }
      });
      if (result.customers && result.customers.length > 0) {
        customerId = result.customers[0].id;
      }
    } catch (e) {
      console.error("Error searching customer:", e.message);
    }

    if (!customerId) {
      const { result } = await customersApi.createCustomer({
        givenName: fullName,
        emailAddress: email,
        phoneNumber: phone,
        note: firstVisit === 'yes' ? 'Signed waiver' : 'Returning guest'
      });
      customerId = result.customer.id;
    }

    // Google Sheets
    const doc = new GoogleSpreadsheet('YOUR_GOOGLE_SHEET_ID_HERE');
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      "Full Name": fullName,
      Email: email,
      Phone: phone,
      "First Visit": firstVisit,
      "Waiver Signed": firstVisit === 'yes' ? 'Yes' : 'Already signed'
    });

    res.status(200).json({ success: true, message: "Check-in successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
