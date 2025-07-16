import axios from "axios";
import { showAlert } from "./alerts";

export const adminUpdateUser = async (userId, index) => {
  const balanceInput = document.getElementById(`balance-${index}`);
  const existingBalance = balanceInput.getAttribute('data-existing-balance');
  const balance = balanceInput.value ? balanceInput.value : existingBalance;
  const isFrozen = document.getElementById(`isFrozen-${index}`).value === "true";
  const autoUpdateBalance = document.getElementById(`autoUpdateBalance-${index}`).value === "true";

  try {
    const res = await axios({
      method: "PATCH",
      url: `/admin/users/${userId}`,
      data: {
        balance,
        isFrozen,
        autoUpdateBalance
      }
    });

    if (res.status === 200) {
      showAlert("success", "Updated Successfully!");
      window.setTimeout(() => {
        location.reload(true);
        // console.log("browser");
      }, 2500);
    }
    // console.log(res);
  } catch (e) {
    showAlert("danger", "Error Updating. Try again later");
  }
};
