import axios from "axios";
import { showAlert } from "./alerts";

export const createNewUser = async (
  firstName,
  lastName,
  phonenum,
  email,
  password
) => {
  // console.log(firstName, lastName, phonenum, email, password);
  try {
    const res = await axios({
      method: "POST",
      url: "/users/register", // http://127.0.0.1:3000/users/register
      data: {
        firstName,
        lastName,
        phonenum,
        email,
        password
      }
    });

    // console.log(res);

    if (res.status === 201) {
      showAlert("success", "User created successfully!");
      window.setTimeout(() => {
        location.assign("/account");
        // console.log("browser");
      }, 2500);
    }
    // console.log(res);
  } catch (e) {
    showAlert("danger", e);
  }
};
