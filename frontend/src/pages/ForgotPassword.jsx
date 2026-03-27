import { Typography, TextField, Button, Alert } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post("/api/auth/forgot-password/", { email });
      setSuccess("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.");
    } catch {
      setError("تعذر إرسال الرابط. تأكد من البريد الإلكتروني.");
    }
  };

  return (
    <AuthLayout>
      <Typography variant="h4" sx={titleStyle}>
        نسيت كلمة المرور؟
      </Typography>

      <Typography sx={subtitleStyle}>
        أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين
      </Typography>

      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 3 }}
          InputProps={{
            endAdornment: <EmailIcon />,
          }}
        />

        <Button
          fullWidth
          size="large"
          type="submit"
          sx={buttonStyle}
        >
          إرسال الرابط
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

const subtitleStyle = {
  fontFamily: "Cairo",
  color: "text.secondary",
  mb: 3,
};

const buttonStyle = {
  mt: 3,
  py: 1.5,
  fontFamily: "Cairo",
  fontWeight: "bold",
  bgcolor: "#0A2342",
  ":hover": { bgcolor: "#06152a" },
};
