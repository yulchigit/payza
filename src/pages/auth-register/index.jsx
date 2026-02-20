import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import AuthShell from "components/auth/AuthShell";
import { useAuth } from "contexts/AuthContext";

const AuthRegister = () => {
  const navigate = useNavigate();
  const { register, normalizeAuthError } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setError("");
  };

  const validate = () => {
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      navigate("/user-wallet-dashboard", { replace: true });
    } catch (authError) {
      setError(normalizeAuthError(authError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Register a secure PayZa account to start real transactions"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          type="text"
          value={formData.fullName}
          onChange={handleChange("fullName")}
          autoComplete="name"
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange("password")}
          autoComplete="new-password"
          description="Use uppercase, lowercase, number, and symbol."
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          autoComplete="new-password"
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>
          Create Account
        </Button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-5">
        Already registered?{" "}
        <Link to="/auth/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default AuthRegister;
