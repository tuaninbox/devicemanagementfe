import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { changePassword } from "../api/auth";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔒 Validate new password match
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);

      // Clear forcePasswordChange flag
      setUser({
        ...user,
        forcePasswordChange: false
      });

      setSuccess("Password updated successfully");

      setTimeout(() => navigate("/"), 800);

    } catch (err) {
      setError("Failed to update password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Change Your Password</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-input"
            placeholder="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            className="login-input"
            placeholder="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            className="login-input"
            placeholder="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="login-button">
            Update Password
          </button>

          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success">{success}</p>}
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
