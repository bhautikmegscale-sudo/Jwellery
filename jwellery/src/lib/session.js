import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.SESSION_SECRET || 'super-secret-key-change-me';
const key = new TextEncoder().encode(SECRET_KEY);

export async function createSession(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);
}

export async function verifySession(token) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}
