export const operator = process.env.PUBLIC_SITE_OPERATOR?.trim() || '';
export const contactEmail = process.env.PUBLIC_CONTACT_EMAIL?.trim() || '';
export const policiesReady = Boolean(operator && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) && process.env.CONTACT_READY === 'true');
