// trader.js

import axios from 'axios';
import { showModal, showAlert } from './alerts'

// Function to add a trader to the user's selected traders list
export const addSelectedTrader = async (userId, traderId, userIndex, selectType) => {
  try {
    const res = await axios.post(`/users/${userId}/select-trader/${traderId}`);
    if (res.data) {
        showModal('Trader added!', userIndex, selectType)
        window.setTimeout(() => {
          location.reload(true)
      }, 1500)
        return res.data; // Assuming server returns a success message upon adding the trader
    }
    
  } catch (error) {
    showModal(error.response.data.error || 'Failed to add trader', userIndex, selectType); // Handle errors
  }
};

export const removeSelectedTrader = async (userId, traderId, userIndex, selectType) => {
    try {
      const res = await axios.delete(`/users/${userId}/deselect-trader/${traderId}`);
      if (res.data) {
          showModal('Trader removed!', userIndex, selectType)
          window.setTimeout(() => {
            location.reload(true)
        }, 1500)
          return res.data; // Assuming server returns a success message upon adding the trader
      }
      
    } catch (error) {
      showModal(error.response.data.error || 'Failed to remove trader', userIndex, selectType); // Handle errors
    }
};

export const deleteTrader = async (traderId) => {
  try {
    const res = await axios.delete(`/traders/${traderId}`);
    if (res.status === 200) {
      showAlert('success', 'Trader deleted successfully')
        window.setTimeout(() => {
          location.reload(true)
      }, 2000)
      // return res.data; // Assuming server returns a success message upon adding the trader
    }else {
      showAlert('danger', res.data.error || 'Failed to delete trader');
    }
    
  } catch (error) {
    console.error('Error deleting trader:', error);
    showAlert('danger', error.response?.data?.error || 'Failed to delete trader');
  }
};

export const addNewTrader = async (name, winRate, profitShare, avatarFile) => {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('winRate', winRate);
    formData.append('profitShare', profitShare);
    formData.append('avatar', avatarFile); // Make sure to append the file

    const res = await axios({
      method: 'POST',
      url: '/traders',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.status == 201) {
      showAlert('success', 'Trader Created Successfully');
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (e) {
    console.log(e);
    showAlert('danger', `error adding trader: ${e.response?.data?.error || e.message}`);
  }
};

