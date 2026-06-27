// Cookie configuration for auth tokens
// Tokens are stored in HttpOnly cookies to prevent XSS attacks

export const AUTH_COOKIE_NAME = "nutridrip_token";
export const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: AUTH_COOKIE_MAX_AGE,
  path: "/",
};

export const COOKIE_OPTIONS_CLEAR = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 0,
  path: "/",
};