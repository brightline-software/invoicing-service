// Atlas is the company API gateway. It terminates TLS, checks the session
// and forwards the request with signed identity headers.
export const ATLAS_HEADERS = {
  user: 'x-atlas-user',
  roles: 'x-atlas-roles',
  signature: 'x-atlas-signature',
  requestId: 'x-atlas-request-id',
} as const;

export type Role = 'developer' | 'finance' | 'support' | 'admin';

export interface AtlasIdentity {
  userId: string;
  roles: Role[];
  requestId: string;
}

export function parseRoles(header: string | undefined): Role[] {
  if (!header) return [];
  return header.split(',').map((r) => r.trim()).filter(Boolean) as Role[];
}
