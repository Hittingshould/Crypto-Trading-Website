import axios from 'axios';
import { showAlert } from './alerts'

// Function to update transaction
export const updateTransaction = async (transactionId, index) => {
  console.log(transactionId, index, status)
  let status = document.getElementById(`pending-${index}`).value
  if (status === 'approved') {
    status = 'approved'
  } else if (status === 'canceled') {
    status = 'canceled'
  } else {
    status = 'pending'
  }
  try {
    const res = await axios({
      method: "POST",
      url: `/update-transaction/${transactionId}`,
      data: {
        status
      }
    });
    if (res.data) {
        showAlert('success', 'Transaction Updated')
        window.setTimeout(() => {
          location.reload(true)
      }, 1500)
    }
    
  } catch (error) {
    showAlert('danger', 'Failed To Update Transaction'); // Handle errors
  }
};