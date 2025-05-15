import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
};

function generateKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password.normalize("NFKC"), salt, 64, {
    N: config.N,
    r: config.r,
    p: config.p,
    maxmem: 128 * config.N * config.r * 2,
  }) as Buffer;
}

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16);
  const hash = generateKey(password, salt).toString("hex");
  return `${salt.toString("hex")}:${hash}`;
};

export const verifyPassword = async ({
  hash,
  password,
}: {
  hash: string;
  password: string;
}) => {
  const [saltHex, keyHex] = hash.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const expectedKey = Buffer.from(keyHex, "hex");
  const derivedKey = generateKey(password, salt);
  return timingSafeEqual(derivedKey, expectedKey);
};
