import React, { useContext, useState } from "react";
import axios from "axios";
import { apiUrl } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/StoreContext";

const LoginPage = () => {
  let { setUser, setToken } = useContext(AuthContext);
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [errorMessage, setErrorMessage] = useState("");
  let [loading, setLoading] = useState(false);
  let navigate = useNavigate();

  let login = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      let result = await axios({
        url: apiUrl("/api/auth/login"),
        method: "post",
        data: { email, password },
      });

      setToken(result.data.token);
      setUser(result.data.result);
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page narrow loginPage lightFormPage">
      <h2>Welcome back</h2>
      <p className="loginIntro">Log in to your Snowstep account.</p>
      <form className="form" onSubmit={login}>
        <div>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {errorMessage && (
          <p className="loginError" role="alert">
            {errorMessage}
          </p>
        )}
        <button className="btnPrimary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
        <Link className="loginBackLink" to="/">
          Back to shopping
        </Link>
        <Link className="loginBackLink" to="/register">
          Create an account
        </Link>
      </form>
    </main>
  );
};

export default LoginPage;
