import type { Request, Response, NextFunction } from 'express';
import { createVerify } from 'node:crypto';
import { config } from '../config.js';
import { ATLAS_HEADERS, parseRoles, type AtlasIdentity, type Role } from './gateway.js';

declare module 'express-serve-static-core' {
  interface Request {
    identity?: AtlasIdentity;
  }
}

function signatureIsValid(req: Request): boolean {
  // Local development: Atlas is not running, so we accept the dev token instead.
  if (config.NODE_ENV !== 'production' && req.header('authorization') === `Bearer ${config.ATLAS_DEV_TOKEN}`) {
    return true;
  }
  const signature = req.header(ATLAS_HEADERS.signature);
  if (!signature || !config.ATLAS_PUBLIC_KEY) return false;
  const verifier = createVerify('SHA256');
  verifier.update(`${req.header(ATLAS_HEADERS.user)}|${req.header(ATLAS_HEADERS.roles)}`);
  return verifier.verify(config.ATLAS_PUBLIC_KEY, signature, 'base64');
}

export function atlasAuth(req: Request, res: Response, next: NextFunction) {
  if (!signatureIsValid(req)) {
    return res.status(401).json({ error: 'Request did not come through Atlas' });
  }
  req.identity = {
    userId: req.header(ATLAS_HEADERS.user) ?? 'local-dev',
    roles: parseRoles(req.header(ATLAS_HEADERS.roles) ?? 'developer'),
    requestId: req.header(ATLAS_HEADERS.requestId) ?? crypto.randomUUID(),
  };
  next();
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.identity?.roles.includes(role) && !req.identity?.roles.includes('admin')) {
      return res.status(403).json({ error: `Requires role ${role}` });
    }
    next();
  };
}
