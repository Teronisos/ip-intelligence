const axios = require('axios');

exports.getAbuseData = async (ip) => {
  try {
    const token = process.env.NODE_API_TOKEN;
    const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
      params: { ipAddress: ip },
      headers: {
        'Key': token,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from AbuseIPDB:', error);
    throw error;
  }
}