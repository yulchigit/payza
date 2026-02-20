import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import AuthShell from "components/auth/AuthShell";
import { useAuth } from "contexts/AuthContext";

const AuthLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, normalizeAuthError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = location?.state?.from || "/user-wallet-dashboard";

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password
      });
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(normalizeAuthError(authError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to continue using your PayZa account"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" fullWidth loading={loading}>
          Sign In
        </Button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-5">
        No account yet?{" "}
        <Link to="/auth/register" className="text-primary font-medium hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
};

export default AuthLogin;
