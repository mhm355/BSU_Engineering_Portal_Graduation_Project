import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Alert,
  Box,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import axios from "axios";
import AuthLayout from "../layouts/AuthLayout";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    try {
      await axios.post("/api/auth/reset-password/", {
        token,
        password,
      });
      setSuccess("تم تغيير كلمة المرور بنجاح");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("الرابط غير صالح أو منتهي");
    }
  };

  return (
    <AuthLayout>
      <LockResetIcon sx={{ fontSize: 60, color: "#0A2342", mb: 2 }} />

      <Typography variant="h4" sx={titleStyle}>
        إعادة تعيين كلمة المرور
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          type="password"
          label="كلمة المرور الجديدة"
          sx={{ mt: 3 }}
          onChange={(e) => setPassword(e.target.value)}
        />

        <TextField
          fullWidth
          type="password"
          label="تأكيد كلمة المرور"
          sx={{ mt: 2 }}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <Button fullWidth size="large" type="submit" sx={buttonStyle}>
          حفظ كلمة المرور
        </Button>
      </form>
    </AuthLayout>
  );
}

const titleStyle = {
  fontFamily: "Cairo",
  fontWeight: "bold",
  color: "#0A2342",
  mt: 2,
};

const buttonStyle = {
  mt: 3,
  py: 1.5,
  fontFamily: "Cairo",
  fontWeight: "bold",
  bgcolor: "#0A2342",
};
