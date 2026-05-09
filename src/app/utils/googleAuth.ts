import { OAuth2Client } from 'google-auth-library';
import { envVars } from '../../config/env';

const client = new OAuth2Client(envVars.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: envVars.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  
  if (!payload) {
    throw new Error('Invalid Google token');
  }

  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    googleId: payload.sub,
  };
};
