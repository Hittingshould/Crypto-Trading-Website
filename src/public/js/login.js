import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  // console.log(email, password)
  try {
    const res = await axios({
      method: "POST",
      url: "/users/login",
      data: {
        email,
        password
      }
    });

    if (res.status === 200) {
      showAlert("success", "Logged in successfully!!");
      const role = res.data.user.role[0]
      const isFrozen = res.data.user.isFrozen

      if (isFrozen) {
        localStorage.setItem('frozenMessage', 'Your account is frozen. Please contact support.');
      }

      window.setTimeout(() => {
        if (role === 'admin') {
          location.assign("/admin");
        }else {
          location.assign("/account");
        }
      }, 2500);
    }
    // console.log(res);
  } catch (error) {
    // console.log(e)
    // if (e.response && e.response.status === 403) {
    //   location.assign('/account');
    //   accountFrozenModal('Account Frozen. Please Contact Support')
    //     // const errorMessage = encodeURIComponent(e.response.data.error);
    //     // location.assign(`/error?message=${errorMessage}`);
    // } else {
       showAlert("danger", `Error: ${error.response.data.error}`);
    // }
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/users/Logout"
    });
    if (res.status === 200) location.assign("/");
  } catch (e) {
    showAlert("error", "Error logging out");
  }
};
