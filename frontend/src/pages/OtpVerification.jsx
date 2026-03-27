import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import AuthLayout from "../layouts/AuthLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const verifyOtp = async () => {
    try {
      await axios.post("/api/auth/verify-otp/", { otp });
      navigate("/change-password");
    } catch {
      setError("رمز التحقق غير صحيح");
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h4" sx={{ fontFamily: "Cairo", mb: 2 }}>
        تحقق من الرمز
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        fullWidth
        label="رمز التحقق"
        sx={{ mt: 2 }}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <Button fullWidth size="large" sx={buttonStyle} onClick={verifyOtp}>
        تحقق
      </Button>
    </AuthLayout>
  );
}

const buttonStyle = {
  mt: 3,
  py: 1.5,
  fontFamily: "Cairo",
  fontWeight: "bold",
  bgcolor: "#0A2342",
};
