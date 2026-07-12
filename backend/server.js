const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// ── Uploads (profile photos) ───────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Serve uploaded images statically at /uploads/<file>
app.use("/uploads", express.static(UPLOAD_DIR));

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

// ── Middleware ────────────────────────────────────────────────────────────────
const DEFAULT_CLIENT_ORIGINS = [
  ...[3000, 4173, 5173, 5174, 5175, 8080, 8081, 8082, 8083, 8084, 8085].flatMap(
    (port) => [`http://localhost:${port}`, `http://127.0.0.1:${port}`],
  ),
];

function getAllowedOrigins() {
  const configuredOrigins =
    process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || "";
  const origins = configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(origins.length > 0 ? origins : DEFAULT_CLIENT_ORIGINS);
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has("*") || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  }),
);
app.use(express.json());

// ── JWT Secret ────────────────────────────────────────────────────────────────
const JWT_SECRET =
  process.env.JWT_SECRET || "pathpilot-dev-secret-change-in-production";

// ── User Schema ───────────────────────────────────────────────────────────────
// IMPORTANT: `role` is NEVER accepted from request body on registration.
// All new accounts are always created with role = "user".
// Admin accounts can only be created via the seed-admin.js script.
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false, // never returned in queries by default
  },
  // Role is server-controlled only — never accepted from client input
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // ── Profile fields (IT-student focused) — all optional ──
  avatarUrl: { type: String, trim: true, default: "", maxlength: 500 },
  university: { type: String, trim: true, default: "", maxlength: 150 },
  degree: { type: String, trim: true, default: "", maxlength: 150 },
  specialization: { type: String, trim: true, default: "", maxlength: 150 },
  yearStatus: { type: String, trim: true, default: "", maxlength: 60 },
  careerInterests: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  bio: { type: String, trim: true, default: "", maxlength: 500 },
  linkedinUrl: { type: String, trim: true, default: "", maxlength: 300 },
  githubUrl: { type: String, trim: true, default: "", maxlength: 300 },
  portfolioUrl: { type: String, trim: true, default: "", maxlength: 300 },

  // Career Progress Tracker — completed roadmap items keyed by career name,
  // e.g. { "Data Analyst": ["Master SQL", ...] }. Rule-based roadmap lives on
  // the frontend; this only stores which items the user has checked off.
  careerProgress: { type: mongoose.Schema.Types.Mixed, default: {} },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
// NOTE: Mongoose 9+ treats async pre-hooks as promise-based — `next` is NOT
// passed as a parameter. Simply return / throw; do NOT call next().
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// ── Assessment Schema ─────────────────────────────────────────────────────────
const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    degree: String,
    programming: Number,
    mathematics: Number,
    communication: Number,
    leadership: Number,
    creativity: Number,
    problemSolving: Number,
    business: Number,
    personality: String,
    prediction: String,
    matchScores: Object,
    source: {
      type: String,
      enum: ["ml", "mock"],
      default: "mock",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { minimize: false },
);

const Assessment =
  mongoose.models.Assessment || mongoose.model("Assessment", assessmentSchema);

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function normalizeRegistrationInput(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  return { name, email, password };
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    avatarUrl: user.avatarUrl || "",
    university: user.university || "",
    degree: user.degree || "",
    specialization: user.specialization || "",
    yearStatus: user.yearStatus || "",
    careerInterests: user.careerInterests || [],
    skills: user.skills || [],
    bio: user.bio || "",
    linkedinUrl: user.linkedinUrl || "",
    githubUrl: user.githubUrl || "",
    portfolioUrl: user.portfolioUrl || "",
    careerProgress: user.careerProgress || {},
  };
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

async function getUserFromToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded?.id) return null;
  return User.findById(decoded.id);
}

async function authenticate(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token is required." });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User for this token no longer exists.",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}

async function attachUserIfTokenPresent(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return next();

  try {
    const user = await getUserFromToken(token);
    if (user) {
      req.user = user;
    } else {
      console.warn(
        "[/api/assess] Optional auth token matched no user; continuing as guest.",
      );
    }

    return next();
  } catch (error) {
    console.warn(
      `[/api/assess] Optional auth ignored invalid token; continuing as guest. ${error.message}`,
    );
    return next();
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    return next();
  };
}

function sendKnownRegistrationError(error, res) {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ success: false, message: messages.join(" ") });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists.",
    });
  }

  return null;
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({ message: "PathPilot Backend is Running! 🚀" });
});

/**
 * POST /api/auth/register
 * Creates a new user account.
 *
 * Accepted body fields: name, email, password
 * Role is ALWAYS hardcoded to "user" — any `role` field in the
 * request body is silently ignored. Admin accounts cannot be
 * created through this endpoint.
 */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = normalizeRegistrationInput(req.body);

    // Basic presence validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Reject if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Create user — role is ALWAYS "user", never from req.body
    const user = await User.create({
      name,
      email,
      password, // hashed by pre-save hook
      role: "user", // hardcoded — cannot be overridden by client
    });

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    // Log the full error so the real cause is visible in the backend console
    console.error("Registration error:", error);

    if (sendKnownRegistrationError(error, res)) return;

    res
      .status(500)
      .json({ success: false, message: "Server error during registration." });
  }
});

/**
 * POST /api/auth/login
 * Authenticates an existing user.
 *
 * Returns the user's role so the client can redirect accordingly:
 *   - role === "admin"  → /admin/dashboard
 *   - role === "user"   → / or /assessment
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Explicitly select password (excluded by default via `select: false`)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: "Signed in successfully.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login. Check backend logs.",
    });
  }
});

/**
 * GET /api/auth/me
 * Verifies a JWT and returns the current user. Frontend protected routes use
 * this instead of trusting localStorage alone.
 */
app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user),
  });
});

/**
 * GET /api/user/profile
 * Returns the authenticated user's full profile (own data only).
 */
app.get("/api/user/profile", authenticate, (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

/**
 * PATCH /api/user/profile
 * Updates the authenticated user's own profile. Only whitelisted fields are
 * accepted — `role`, `email`, and `password` can NEVER be changed here.
 */
const EDITABLE_STRING_FIELDS = [
  "name",
  "avatarUrl",
  "university",
  "degree",
  "specialization",
  "yearStatus",
  "bio",
  "linkedinUrl",
  "githubUrl",
  "portfolioUrl",
];
const EDITABLE_ARRAY_FIELDS = ["careerInterests", "skills"];

app.patch("/api/user/profile", authenticate, async (req, res) => {
  try {
    const updates = {};

    for (const field of EDITABLE_STRING_FIELDS) {
      if (typeof req.body[field] === "string") {
        updates[field] = req.body[field].trim();
      }
    }
    for (const field of EDITABLE_ARRAY_FIELDS) {
      if (Array.isArray(req.body[field])) {
        updates[field] = req.body[field]
          .filter((v) => typeof v === "string")
          .map((v) => v.trim())
          .filter(Boolean)
          .slice(0, 30);
      }
    }

    if (!updates.name && req.body.name !== undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Name cannot be empty." });
    }

    // Operates strictly on the authenticated user's own record.
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Profile updated.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(" ") });
    }
    console.error("Profile update error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error updating profile." });
  }
});

/**
 * POST /api/user/photo
 * Uploads a profile photo (multipart field "photo") for the authenticated user.
 * Stores the file in /uploads and saves its URL on the user's avatarUrl.
 * Only ever updates the requester's own record.
 */
app.post("/api/user/photo", authenticate, (req, res) => {
  uploadPhoto.single("photo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded." });
    }
    try {
      const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatarUrl: url },
        { new: true },
      );
      res.json({
        success: true,
        message: "Profile photo updated.",
        user: publicUser(user),
      });
    } catch (error) {
      console.error("Photo upload error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error saving photo." });
    }
  });
});

/**
 * GET /api/user/progress
 * Returns the authenticated user's Career Progress Tracker state (own data only).
 */
app.get("/api/user/progress", authenticate, (req, res) => {
  res.json({ success: true, progress: req.user.careerProgress || {} });
});

/**
 * PATCH /api/user/progress
 * Saves the completed checklist items for one career.
 * Body: { career: string, completedTasks: string[] }
 * Only ever updates the requester's own record; never touches role/email.
 */
app.patch("/api/user/progress", authenticate, async (req, res) => {
  try {
    const career =
      typeof req.body.career === "string" ? req.body.career.trim() : "";
    if (!career) {
      return res
        .status(400)
        .json({ success: false, message: "career is required." });
    }
    const completedTasks = Array.isArray(req.body.completedTasks)
      ? req.body.completedTasks
          .filter((t) => typeof t === "string")
          .slice(0, 50)
      : [];

    const user = await User.findById(req.user._id);
    const progress = { ...(user.careerProgress || {}) };
    progress[career] = completedTasks;
    user.careerProgress = progress;
    user.markModified("careerProgress"); // Mixed type — tell Mongoose it changed
    await user.save();

    res.json({ success: true, progress: user.careerProgress });
  } catch (error) {
    console.error("Progress update error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error saving progress." });
  }
});

/**
 * DELETE /api/user/account
 * Permanently deletes the authenticated user's own account and their
 * assessments. Cannot delete any other user.
 */
app.delete("/api/user/account", authenticate, async (req, res) => {
  try {
    await Assessment.deleteMany({ userId: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: "Account deleted." });
  } catch (error) {
    console.error("Account deletion error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error deleting account." });
  }
});

// ── Mock recommendation engine ────────────────────────────────────────────────
// Placeholder for the future ML model. Produces a deterministic prediction +
// per-career match scores by keyword-matching the user's answers. Always returns
// every career so the results page can rank them.
// IT-focused career catalog. Keywords are lowercase fragments that appear in the
// IT assessment answer options (see frontend assessment.tsx).
const CAREER_KEYWORDS = {
  "Data Analyst": [
    "data analyst",
    "data analysis",
    "databases & sql",
    "statistics & math",
    "analyzing data & finding patterns",
    "data & logic",
    "analytical",
    "detail-oriented",
    "mostly structured",
  ],
  "Data Scientist": [
    "data scientist",
    "data analysis",
    "statistics & math",
    "machine learning & ai",
    "analyzing data & finding patterns",
    "training ml / ai models",
    "data & logic",
    "analytical",
    "curious",
    "research-focused",
  ],
  "Machine Learning Engineer": [
    "machine learning engineer",
    "machine learning",
    "programming",
    "algorithms & data structures",
    "building apps & software",
    "training ml / ai models",
    "building & coding",
    "i love coding",
    "problem-solver",
  ],
  "Software Engineer": [
    "software engineer",
    "web & app development",
    "programming",
    "algorithms & data structures",
    "building apps & software",
    "building & coding",
    "i love coding",
    "problem-solver",
    "independent / remote",
    "mostly flexible",
  ],
  "Business Analyst": [
    "business analyst",
    "business analysis",
    "project & business management",
    "solving business problems",
    "business & strategy",
    "communicator",
    "analytical",
    "structured corporate",
    "mostly structured",
  ],
  "UI/UX Designer": [
    "ui/ux designer",
    "ui/ux & design",
    "design & prototyping",
    "designing user interfaces",
    "visual & design",
    "creative",
    "highly flexible",
    "fast-paced startup",
  ],
  "Cybersecurity Analyst": [
    "cybersecurity analyst",
    "cybersecurity",
    "networking & security",
    "securing systems & networks",
    "security & investigation",
    "detail-oriented",
    "mostly structured",
  ],
  "Cloud / DevOps Engineer": [
    "cloud / devops engineer",
    "cloud & devops",
    "cloud computing",
    "networking & security",
    "programming",
    "working with cloud & infrastructure",
    "structured corporate",
  ],
  "Project Manager": [
    "project manager",
    "project & business management",
    "planning & coordinating projects",
    "people & coordination",
    "business & strategy",
    "leader",
    "communicator",
    "collaborative team",
    "structured corporate",
  ],
};

// Suggested skills per career — shown on the results page. Placeholder for the
// ML service, which will return its own suggested-skills list later.
const SUGGESTED_SKILLS = {
  "Data Analyst": [
    "SQL",
    "Excel",
    "Python",
    "Data Visualization",
    "Statistics",
  ],
  "Data Scientist": [
    "Python",
    "Statistics",
    "Machine Learning",
    "Pandas / NumPy",
    "SQL",
  ],
  "Machine Learning Engineer": [
    "Python",
    "TensorFlow / PyTorch",
    "ML Algorithms",
    "Data Structures",
    "MLOps",
  ],
  "Software Engineer": [
    "Data Structures",
    "Git",
    "A Programming Language",
    "APIs",
    "System Design",
  ],
  "Business Analyst": [
    "Requirements Gathering",
    "SQL",
    "Excel",
    "Process Modeling",
    "Power BI",
  ],
  "UI/UX Designer": [
    "Figma",
    "User Research",
    "Wireframing",
    "Visual Design",
    "Prototyping",
  ],
  "Cybersecurity Analyst": [
    "Networking",
    "Linux",
    "Security+ Fundamentals",
    "Threat Analysis",
    "SIEM Tools",
  ],
  "Cloud / DevOps Engineer": [
    "Linux",
    "Docker",
    "AWS / Azure",
    "CI/CD",
    "Kubernetes",
  ],
  "Project Manager": [
    "Agile / Scrum",
    "Stakeholder Management",
    "Roadmapping",
    "Risk Management",
    "Jira",
  ],
};

function computeRecommendation(answers = {}, degree = "") {
  // Flatten all answer values (+degree) into one lowercase searchable string.
  const haystack = [
    degree,
    ...Object.values(answers).flatMap((v) => (Array.isArray(v) ? v : [v])),
  ]
    .filter(Boolean)
    .join(" | ")
    .toLowerCase();

  const matchScores = {};
  for (const [career, keywords] of Object.entries(CAREER_KEYWORDS)) {
    const hits = keywords.reduce(
      (n, kw) => (haystack.includes(kw) ? n + 1 : n),
      0,
    );
    // Base 50 + 7 per matched keyword, keyword score capped at 94.
    matchScores[career] = Math.min(94, 50 + hits * 7);
  }

  // The "preferred career paths" answer (Section 5) is a strong, explicit
  // signal — give each chosen career a decisive bonus (final cap 99).
  const preferred = Array.isArray(answers.careerPreference)
    ? answers.careerPreference
    : [];
  for (const career of preferred) {
    if (matchScores[career] !== undefined) {
      matchScores[career] = Math.min(99, matchScores[career] + 12);
    }
  }

  // prediction = highest score (ties broken by catalog order, which is stable).
  const prediction = Object.entries(matchScores).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
  const suggestedSkills = SUGGESTED_SKILLS[prediction] || [];
  return { prediction, matchScores, suggestedSkills };
}

// ── ML service integration ─────────────────────────────────────────────────────
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * Calls the FastAPI ML service for a real prediction.
 * Returns { prediction, matchScores (0–100), top3 } or THROWS so the caller can
 * fall back to the mock engine. The ML service returns 0–1 fractions, which we
 * convert to the 0–100 percentages the results page expects.
 */
async function getMlPrediction(answers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const resp = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`ML service responded ${resp.status}`);
    const data = await resp.json();
    if (!data || !data.topCareer)
      throw new Error("ML service returned no prediction");

    const matchScores = {};
    for (const [career, frac] of Object.entries(data.matchScores || {})) {
      matchScores[career] = Math.round(Number(frac) * 100);
    }
    const top3 = (data.top3 || []).map((m) => ({
      career: m.career,
      score: Math.round(Number(m.score) * 100),
    }));
    return { prediction: data.topCareer, matchScores, top3 };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST /api/assess
 * Saves a career assessment result. Public users can complete an assessment
 * without logging in; logged-in users attach their JWT to link it to their user.
 */
app.post("/api/assess", attachUserIfTokenPresent, async (req, res) => {
  try {
    const answers =
      req.body.answers && typeof req.body.answers === "object"
        ? req.body.answers
        : req.body;

    // Try the ML service first; gracefully fall back to the mock engine if it
    // is down or errors — the assessment must never fail to save.
    let prediction, matchScores, top3, source;
    try {
      ({ prediction, matchScores, top3 } = await getMlPrediction(answers));
      source = "ml";
      console.log(
        `[/api/assess] Using ML prediction from ${ML_SERVICE_URL}/predict -> ${prediction}`,
      );
    } catch (err) {
      const mlErrorMessage =
        err.name === "AbortError" ? "timeout (>2500ms)" : err.message;
      console.warn(`[/api/assess] ML error message: ${mlErrorMessage}`);
      console.warn(
        `[/api/assess] Using mock fallback for ${ML_SERVICE_URL}/predict`,
      );
      const computed = computeRecommendation(
        answers,
        req.body.degree || answers.degree,
      );
      prediction = computed.prediction;
      matchScores = computed.matchScores;
      top3 = Object.entries(computed.matchScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([career, score]) => ({ career, score }));
      source = "mock";
      console.log(`[/api/assess] Mock prediction -> ${prediction}`);
    }
    const suggestedSkills = SUGGESTED_SKILLS[prediction] || [];

    const assessment = await Assessment.create({
      ...req.body,
      answers,
      userId: req.user?._id || null,
      degree: req.body.degree || answers.degree,
      prediction,
      matchScores,
      source,
    });

    res.status(201).json({
      success: true,
      message: "Assessment received",
      assessmentId: assessment._id.toString(),
      prediction,
      matchScores,
      top3,
      suggestedSkills,
      source,
    });
  } catch (error) {
    console.error("[/api/assess] Assessment save error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function topCareerFromAssessment(assessment) {
  const matchScores = assessment.matchScores || {};
  const entries = Object.entries(matchScores)
    .filter(([, score]) => Number.isFinite(Number(score)))
    .sort((a, b) => Number(b[1]) - Number(a[1]));
  const career = assessment.prediction || entries[0]?.[0] || "Pending Review";
  const score = Number(matchScores[career] ?? entries[0]?.[1] ?? 0);

  return {
    career,
    score: Number.isFinite(score) ? score : 0,
  };
}

/**
 * GET /api/assessments/me
 * Returns the assessments belonging to the logged-in user (newest first).
 * Guest/anonymous assessments (userId === null) are NEVER returned here —
 * this endpoint only ever surfaces rows linked to req.user._id.
 */
app.get("/api/assessments/me", authenticate, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .lean();

    const items = assessments.map((a) => {
      const top = topCareerFromAssessment(a);
      return {
        id: a._id.toString(),
        prediction: a.prediction || top.career,
        topCareer: top.career,
        topScore: top.score,
        matchScores: a.matchScores || {},
        answers: a.answers || {},
        source: a.source || "mock",
        degree: a.degree || null,
        timestamp: a.timestamp,
      };
    });

    res.json({ success: true, count: items.length, assessments: items });
  } catch (error) {
    console.error("Load my assessments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error loading your assessments.",
    });
  }
});

async function buildAdminAssessmentRows(limit = 0) {
  const query = Assessment.find().sort({ timestamp: -1 });
  if (limit > 0) query.limit(limit);

  const assessments = await query.lean();
  const validUserIds = [
    ...new Set(
      assessments
        .map((assessment) => assessment.userId?.toString())
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id)),
    ),
  ];
  const users = await User.find({ _id: { $in: validUserIds } }).lean();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  return assessments.map((assessment) => {
    const userId = assessment.userId?.toString();
    const user = userId ? usersById.get(userId) : null;
    const topCareer = topCareerFromAssessment(assessment);

    return {
      id: assessment._id.toString(),
      userId: userId || null,
      studentName: user?.name || assessment.answers?.name || "Guest User",
      email: user?.email || null,
      date: assessment.timestamp,
      topCareer: topCareer.career,
      matchScore: topCareer.score,
      source: assessment.source || "mock",
    };
  });
}

async function getAssessmentCountsByUser() {
  const counts = await Assessment.aggregate([
    { $match: { userId: { $ne: null } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);

  return new Map(counts.map((item) => [item._id.toString(), item.count]));
}

/**
 * GET /api/admin/users
 * Admin-only read endpoint for registered users.
 */
app.get(
  "/api/admin/users",
  authenticate,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const [users, assessmentCounts] = await Promise.all([
        User.find().sort({ createdAt: -1 }).lean(),
        getAssessmentCountsByUser(),
      ]);

      res.json({
        success: true,
        users: users.map((user) => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          dateJoined: user.createdAt,
          assessmentsCompleted: assessmentCounts.get(user._id.toString()) || 0,
          role: user.role,
        })),
      });
    } catch (error) {
      console.error("Admin users error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error loading users." });
    }
  },
);

/**
 * GET /api/admin/assessments
 * Admin-only read endpoint for submitted assessments.
 */
app.get(
  "/api/admin/assessments",
  authenticate,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const assessments = await buildAdminAssessmentRows();
      res.json({ success: true, assessments });
    } catch (error) {
      console.error("Admin assessments error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error loading assessments." });
    }
  },
);

/**
 * GET /api/admin/summary
 * Admin-only aggregate endpoint for dashboard and analytics cards.
 */
app.get(
  "/api/admin/summary",
  authenticate,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const [totalUsers, users, assessments] = await Promise.all([
        User.countDocuments(),
        User.find().select("createdAt").lean(),
        buildAdminAssessmentRows(),
      ]);

      const totalAssessments = assessments.length;
      const careerCounts = assessments.reduce((acc, assessment) => {
        acc[assessment.topCareer] = (acc[assessment.topCareer] || 0) + 1;
        return acc;
      }, {});
      const careerDistribution = Object.entries(careerCounts)
        .map(([career, count]) => ({ career, count }))
        .sort((a, b) => b.count - a.count);
      const averageMatchScore =
        totalAssessments > 0
          ? Math.round(
              assessments.reduce((sum, item) => sum + item.matchScore, 0) /
                totalAssessments,
            )
          : 0;
      const mostRecommendedCareer =
        careerDistribution[0]?.career || "No assessments yet";
      const monthFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
      });
      const trend = new Map();

      assessments.forEach((assessment) => {
        const month = monthFormatter.format(new Date(assessment.date));
        const current = trend.get(month) || { month, assessments: 0, users: 0 };
        current.assessments += 1;
        trend.set(month, current);
      });

      users.forEach((user) => {
        const month = monthFormatter.format(new Date(user.createdAt));
        const current = trend.get(month) || { month, assessments: 0, users: 0 };
        current.users += 1;
        trend.set(month, current);
      });

      res.json({
        success: true,
        summaryStats: {
          totalUsers,
          totalAssessments,
          mostRecommendedCareer,
          averageMatchScore,
        },
        careerDistribution,
        assessmentTrend: [...trend.values()],
        recentAssessments: assessments.slice(0, 6),
      });
    } catch (error) {
      console.error("Admin summary error:", error);
      res
        .status(500)
        .json({ success: false, message: "Server error loading summary." });
    }
  },
);

async function connectToMongo() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected Successfully");
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectToMongo();
    return app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
}

app.use((error, req, res, next) => {
  if (error.message && error.message.includes("not allowed by CORS")) {
    return res.status(403).json({ success: false, message: error.message });
  }

  return next(error);
});

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  connectToMongo,
  startServer,
  User,
  Assessment,
  authenticate,
  authorizeRoles,
};
