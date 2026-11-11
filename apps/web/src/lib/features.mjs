// Production launches as a read-only catalogue. Enabling community features
// later requires a reviewed change to both build and deployment configuration.
export const communityEnabled = new URL(import.meta.env.SITE).hostname !== 'velogroupsets.com'
  && import.meta.env.PUBLIC_COMMUNITY_ENABLED !== 'false';
