const axios = require('axios');

exports.getAbuseData = async (ip) => {
  try {
    const token = process.env.NODE_API_TOKEN;
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
    console.error('Error when fetching AbuseIPDB data:', error.message || error);
    return { data: 'N/A' };
  }
};
