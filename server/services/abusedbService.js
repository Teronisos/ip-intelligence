const axios = require('axios');

exports.getAbuseData = async (ip) => {
  try {
    const token = process.env.NODE_API_TOKEN;
    console.log('AbuseIPDB Token:', token);
    if (!token) {
      return { data: 'N/A' };
    }
    
    const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
      params: { ipAddress: ip },
      headers: {
        'Key': token,
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Fehler beim Abrufen von AbuseIPDB-Daten:', error.message || error);
    return { data: 'N/A' };
  }
};
