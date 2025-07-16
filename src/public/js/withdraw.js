import axios from "axios";
import { showAlert } from './alerts'

export const withdrawAmount = async (amount, userId) => {
    try {
      const res = await axios({
        method: 'POST',
        url: '/withdraw',
        data: {
          amount,
          userId
        }
      });
  
      if (res.status === 200) {
        location.assign("/confirm-message")
      }
    } catch (error) {
      showAlert('danger', `Error: ${error.response.data.error}`) 
    }
  };
  