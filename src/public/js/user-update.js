import axios from "axios";
import { showAlert } from "./alerts";

export const updateUserProfile = async (firstName, lastName, phonenum, email, password) => {
  // console.log(email, password)
  try {
    const res = await axios({
      method: "POST",
      url: "/users/profile",
      data: {
        firstName,
        lastName,
        phonenum,
        email,
        password
      }
    });

    if (res.status === 200) {
      showAlert("success", "Account Updated");

      window.setTimeout(() => {
        location.assign("/user-profile");
      }, 1500);
    }
  } catch (error) {
    showAlert("danger", `Error: ${error.response.data.error}`);
  }
};