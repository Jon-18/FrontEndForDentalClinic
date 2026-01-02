import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import Footer from "../components/Footer";
import Navbar from "../components/NavbarHeader.jsx";
import "../style/pages/Login.css";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const toggleForm = () => setIsSignup(!isSignup);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";

    const body = isSignup
      ? { fullName, email, password, role: "patient", phoneNumber }
      : { email, password };

    try {
      const res = await fetch("https://sibongadentalfrontend.onrender.com" + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Password or Email is incorrect");
        return;
      }

      if (isSignup) {
        setIsSignup(false);
        return;
      }

      // Store token + role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") navigate(`/admin/${data.user.id}`);
      else if (data.user.role === "doctor") navigate(`/doctor/${data.user.id}`);
      else navigate(`/patient/${data.user.id}`);

    } catch (error) {
      console.log(error);
      toast.error("Server error");
    }
  };


  return (
    <>
      <Navbar />
      <ToastContainer 
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
      <div className="auth-container">
        <div className="auth-box">
          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {isSignup && (
              <>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Phone Number"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />

                {/* Hidden role */}
                <input type="hidden" value="patient" name="role" />
              </>
            )}

            <button type="submit" className="auth-btn">
              {isSignup ? "Sign Up" : "Log In"}
            </button>
          </form>

          <p className="toggle-text">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={toggleForm}>
              {isSignup ? "Login" : "Sign up"}
            </span>
          </p>

          {!isSignup && (
            <a className="forgot-password" href="/forgot-password">
              Forgot your password?
            </a>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
