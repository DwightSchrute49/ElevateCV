const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.models");
const crypto = require("crypto");

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/$/, "");

function getAppRedirectUrl(path = "/") {
  return new URL(path, `${FRONTEND_URL}/`).toString();
}

function getOAuthConfig(provider) {
  const normalizedProvider = provider.toLowerCase();

  if (normalizedProvider === "google") {
    return {
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      profileUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      scope: ["openid", "email", "profile"].join(" "),
      provider: "google",
    };
  }

  if (normalizedProvider === "github") {
    return {
      authUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      profileUrl: "https://api.github.com/user",
      emailUrl: "https://api.github.com/user/emails",
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      redirectUri: process.env.GITHUB_REDIRECT_URI,
      scope: ["read:user", "user:email"].join(" "),
      provider: "github",
    };
  }

  return null;
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function signAuthToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
}

function normalizeUsername(baseValue) {
  const cleanedValue = String(baseValue || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleanedValue || "user";
}

async function makeUniqueUsername(baseValue) {
  const normalizedBase = normalizeUsername(baseValue);
  let candidate = normalizedBase;
  let counter = 1;

  while (await userModel.findOne({ username: candidate })) {
    candidate = `${normalizedBase}-${counter}`;
    counter += 1;
  }

  return candidate;
}

async function fetchOAuthProfile(config, accessToken) {
  const headers = {
    Accept: "application/json",
    "User-Agent": "ai-resume-app",
  };

  if (config.provider === "google") {
    const profileResponse = await fetch(config.profileUrl, {
      headers: {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Unable to fetch Google profile.");
    }

    const profile = await profileResponse.json();

    return {
      providerId: profile.id,
      email: profile.email,
      name: profile.name || profile.given_name || profile.email,
    };
  }

  const profileResponse = await fetch(config.profileUrl, {
    headers: {
      ...headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!profileResponse.ok) {
    throw new Error("Unable to fetch GitHub profile.");
  }

  const profile = await profileResponse.json();

  let email = profile.email || null;

  if (!email && config.emailUrl) {
    const emailResponse = await fetch(config.emailUrl, {
      headers: {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (emailResponse.ok) {
      const emailList = await emailResponse.json();
      const primaryEmail = emailList.find(
        (entry) => entry.primary && entry.verified,
      );
      email =
        primaryEmail?.email ||
        emailList.find((entry) => entry.verified)?.email ||
        null;
    }
  }

  return {
    providerId: String(profile.id),
    email,
    name: profile.name || profile.login || email,
  };
}

async function findOrCreateOAuthUser({ provider, providerId, email, name }) {
  if (!email) {
    throw new Error("OAuth account did not return an email address.");
  }

  let user = await userModel.findOne({
    $or: [{ email }, { authProvider: provider, providerId }],
  });

  if (user) {
    user.authProvider = provider;
    user.providerId = providerId;
    if (!user.username) {
      user.username = await makeUniqueUsername(name || email.split("@")[0]);
    }
    if (!user.email) {
      user.email = email;
    }
    if (!user.password) {
      user.password = null;
    }
    await user.save();
    return user;
  }

  const username = await makeUniqueUsername(name || email.split("@")[0]);

  user = await userModel.create({
    username,
    email,
    password: null,
    authProvider: provider,
    providerId,
  });

  return user;
}

async function registerUserController(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      return res.status(409).json({
        message: "An account with this username or email already exists.",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hash,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "An account with this username or email already exists.",
      });
    }

    console.error("registerUserController error:", err);
    return res.status(500).json({
      message: "Unable to register right now. Please try again.",
    });
  }
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in the req body
 * @access public
 */
async function loginUserController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  if (!user.password) {
    return res.status(400).json({
      message: "This account uses OAuth. Please sign in with Google or GitHub.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const token = signAuthToken(user);

  res.cookie("token", token, getCookieOptions());
  res.status(200).json({
    message: "user logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}
/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in public
 * @access public
 */
async function logoutUserController(req, res) {
  const token = req.cookies.token;
  if (token) {
    await tokenBlacklistModel.create({ token });
  }

  res.clearCookie("token");

  res.status(200).json({
    message: "user logged out successfully",
  });
}

/**
 * @name getMeController
 * @desctription get the currecnt logged in user details
 * @access private
 */
async function getMeController(req, res) {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    message: "user details fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function startOAuthController(req, res) {
  const provider = String(req.params.provider || "").toLowerCase();
  const config = getOAuthConfig(provider);

  if (!config) {
    return res.status(400).json({ message: "Unsupported OAuth provider." });
  }

  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    return res.status(500).json({
      message: `OAuth is not configured for ${provider}.`,
    });
  }

  const state = crypto.randomBytes(16).toString("hex");
  res.cookie(`oauth_state_${provider}`, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
  });

  const authorizeParams = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope,
    state,
  });

  if (provider === "google") {
    authorizeParams.set("access_type", "offline");
    authorizeParams.set("prompt", "consent");
  }

  return res.redirect(`${config.authUrl}?${authorizeParams.toString()}`);
}

async function oauthCallbackController(req, res) {
  const provider = String(req.params.provider || "").toLowerCase();
  const config = getOAuthConfig(provider);
  const { code, state } = req.query;
  const stateCookieName = `oauth_state_${provider}`;
  const expectedState = req.cookies[stateCookieName];

  res.clearCookie(stateCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (!config || !code || !state || !expectedState || state !== expectedState) {
    return res.redirect(getAppRedirectUrl("/login?oauth=error"));
  }

  try {
    const tokenRequestBody = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: String(code),
      redirect_uri: config.redirectUri,
    });

    if (provider === "google") {
      tokenRequestBody.set("grant_type", "authorization_code");
    }

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ai-resume-app",
      },
      body: tokenRequestBody.toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange OAuth code for a token.");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("OAuth provider did not return an access token.");
    }

    const oauthProfile = await fetchOAuthProfile(config, accessToken);
    const user = await findOrCreateOAuthUser({
      provider,
      providerId: oauthProfile.providerId,
      email: oauthProfile.email,
      name: oauthProfile.name,
    });

    const token = signAuthToken(user);
    res.cookie("token", token, getCookieOptions());

    return res.redirect(getAppRedirectUrl("/dashboard"));
  } catch (err) {
    console.error(`${provider} oauth callback error:`, err);
    return res.redirect(getAppRedirectUrl("/login?oauth=error"));
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
  startOAuthController,
  oauthCallbackController,
};
