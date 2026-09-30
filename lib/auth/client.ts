import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Same-origin: the auth API is served by this app under /api/auth.
export const authClient = createAuthClient({ plugins: [magicLinkClient()] });
