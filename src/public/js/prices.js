import axios from 'axios';

export const getLivePrices = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd&include_24hr_change=true');
    return response.data;
  } catch (error) {
    console.error('Error fetching live prices:', error);
    return null;
  }
};
