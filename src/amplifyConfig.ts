import { Amplify } from "aws-amplify";

// Values come from .env (filled from `terraform output` in infra/).
// VITE_ prefix is required so Vite exposes them to browser code.
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN; // e.g. fitstyle-ai-hind-2026.auth.us-east-1.amazoncognito.com (no https://)

if (!userPoolId || !userPoolClientId) {
  console.warn(
    "[Amplify] Missing VITE_COGNITO_USER_POOL_ID or VITE_COGNITO_CLIENT_ID in .env -- auth will not work."
  );
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        oauth: {
          domain: cognitoDomain,
          scopes: ["email", "openid", "profile"],
          redirectSignIn: ["http://localhost:3001"],
          redirectSignOut: ["http://localhost:3001"],
          responseType: "code",
        },
      },
    },
  },
});

export {};
