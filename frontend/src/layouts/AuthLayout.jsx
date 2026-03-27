import { Box, Container, Paper } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(-45deg,#0A2342,#19376D,#576CBC,#0A2342)",
        backgroundSize: "400% 400%",
        animation: "gradient 12s ease infinite",
        direction: "rtl",
      }}
    >
      {/* Floating Shapes */}
      <MotionBox
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        sx={{
          position: "absolute",
          width: 140,
          height: 140,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.08)",
          top: "15%",
          right: "10%",
        }}
      />

      <Container maxWidth="sm">
        <MotionPaper
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          elevation={10}
          sx={{ p: 5, borderRadius: 4, textAlign: "center" }}
        >
          <img
            src="/logo.jpg"
            alt="Logo"
            style={{ width: 90, height: 90, borderRadius: "50%" }}
          />
          {children}
        </MotionPaper>
      </Container>

      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </Box>
  );
}
