import "dotenv/config";
import express from "express";
import basicAuth from "express-basic-auth";
import path from "path";

const app = express();

const PORT = process.env.PORT || 3000;
const REALM = process.env.BASIC_AUTH_REALM || "Restricted";

const USER = process.env.BASIC_AUTH_USER;
const PASS = process.env.BASIC_AUTH_PASS;

if (!USER || !PASS) {
  console.error("BASIC_AUTH_USER / BASIC_AUTH_PASS manquants.");
  process.exit(1);
}

// Basic Auth en prod
app.use(
  basicAuth({
    challenge: true,
    realm: REALM,
    users: { [USER]: PASS },
    unauthorizedResponse: () => "Auth required",
  }),
);

// Vite build
app.use(express.static("dist"));

// SPA fallback (React Router)
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve("dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Protected app on port ${PORT}`);
});
