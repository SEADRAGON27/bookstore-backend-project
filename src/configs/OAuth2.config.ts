export const oauthConfig = {
  clientID: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/callback/google',
};
