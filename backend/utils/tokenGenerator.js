import crypto from "crypto";

/**
 * Generates a URL-safe share token
 * @returns {string} A random URL-safe token (22 characters)
 */
export const generateShareToken = () => {
  return crypto.randomBytes(16).toString("base64url");
};
