// news.js
import axios from 'axios';

export const getCryptoNews = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/news');
    const newsList = response.data.data.slice(0, 3); // Fetch only three news items

    // Limit descriptions to only the first sentence
    return newsList.map(news => {
      const description = news.description.split('. ').slice(0, 2).join('. ') + '.';
      const date = new Date(news.date).toLocaleDateString(); // Format the date
      return { ...news, description, date };
    });
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    return null;
  }
};
