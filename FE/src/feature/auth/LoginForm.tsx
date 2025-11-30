// -----------------------------------------------------------------------------
// Copyright 2025 Fenwick Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// -----------------------------------------------------------------------------
import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface LoginFormData {
  username: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(formData.username, formData.password);
      // Redirect to admin page after successful login
      navigate("/admin", { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Đăng nhập thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Tên đăng nhập hoặc Email"
        name="username"
        autoComplete="username"
        autoFocus
        value={formData.username}
        onChange={handleInputChange}
        disabled={isLoading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Mật khẩu"
        type={showPassword ? "text" : "password"}
        id="password"
        autoComplete="current-password"
        value={formData.password}
        onChange={handleInputChange}
        disabled={isLoading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePassword}
                edge="end"
                disabled={isLoading}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{
          mt: 2,
          mb: 2,
          py: 1.5,
          fontSize: "1rem",
          fontWeight: 600,
          borderRadius: 2,
          textTransform: "none",
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Đăng nhập"
        )}
      </Button>
    </Box>
  );
};

export default LoginForm;
