import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/StoreContext";

const RegisterPage = () => {
  let { setUser, setToken } = useContext(AuthContext);
  let [name, setName] = useState("");
  let [email, setEmail] = useState("");
  let [phone, setPhone] = useState("");
  let [addressLine, setAddressLine] = useState("");
  let [city, setCity] = useState("");
  let [district, setDistrict] = useState("");
  let [password, setPassword] = useState("");
  let [confirmPassword, setConfirmPassword] = useState("");
  let [errorMessage, setErrorMessage] = useState("");
  let [loading, setLoading] = useState(false);
  let navigate = useNavigate();

  let createAccount = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      let result = await axios({
        url: "http://localhost:8000/api/auth/register",
        method: "post",
        data: {
          name,
          email,
          phone,
          addressLine,
          city,
          district,
          password,
        },
      });

      setToken(result.data.token);
      setUser(result.data.result);
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page narrow loginPage lightFormPage">
      <h2>Create your account</h2>
      <p className="loginIntro">Join Snowstep and save your delivery details.</p>
      <form className="form" onSubmit={createAccount}>
        <div>
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-phone">Phone number</label>
          <input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-address">Street address</label>
          <input
            id="register-address"
            type="text"
            autoComplete="street-address"
            value={addressLine}
            onChange={(event) => setAddressLine(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-city">City</label>
          <input
            id="register-city"
            type="text"
            autoComplete="address-level2"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-district">District</label>
          <input
            id="register-district"
            type="text"
            autoComplete="address-level1"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            minLength="8"
            maxLength="128"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            minLength="8"
            maxLength="128"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>
        {errorMessage && (
          <p className="loginError" role="alert">
            {errorMessage}
          </p>
        )}
        <button className="btnPrimary" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
        <Link className="loginBackLink" to="/login">
          Already have an account? Log in
        </Link>
      </form>
    </main>
  );
};

export default RegisterPage;
