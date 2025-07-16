import axios from "axios";
import { showAlert } from "./alerts";

// Function to send email
export const sendEmail = async (userId, amount) => {
    try {
        const res = await axios({
          method: "POST",
          url: "/send-transaction-email",
          data: {
            userId,
            amount
          }
        });
    
        if (res.status === 200) {
          location.assign("/confirm-deposit")
        }

      } catch (e) {
        showAlert('danger', `Error sending email ${e}`);
      }
};