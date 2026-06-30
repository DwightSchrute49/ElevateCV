const express = require("express");

const authController = require("../controllers/auth.controller");
const authRouter = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

authRouter.post("/register", authController.registerUserController);

/**
 * @route GET /api/auth/oauth/:provider
 * @description start OAuth 2.0 login with Google or GitHub
 * @access public
 */

authRouter.get("/oauth/:provider", authController.startOAuthController);

/**
 * @route GET /api/auth/oauth/:provider/callback
 * @description finish OAuth 2.0 login and issue the app session cookie
 * @access public
 */

authRouter.get(
  "/oauth/:provider/callback",
  authController.oauthCallbackController,
);

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access public
 */

authRouter.post("/login", authController.loginUserController);

/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add token in the blacklist
 * @access public
 */

authRouter.get("/logout", authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */

authRouter.get(
  "/get-me",
  authMiddleware.authUser,
  authController.getMeController,
);

module.exports = authRouter;
