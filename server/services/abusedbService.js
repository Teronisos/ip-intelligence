const axios = require('axios');


exports.getAbuseData = async (ip) => {
  try {
    const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
      params: { ipAddress: ip },
      headers: {
        'Key': '47d0c7285d4858337efc2b4f57584b7485dd5d67ad5b9b704e382872b1dd5f39806ab65a0c451e03',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from AbuseIPDB:', error);
    throw error;
  }
}