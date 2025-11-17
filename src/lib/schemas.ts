import { z } from 'zod';
export const formSchema = z.object({
  name: z.string().min(1, { message: 'Website name is required.' }),
  url: z.string().url({ message: 'Please enter a valid URL (e.g., https://example.com)' }),
  maintainer: z.string().optional(),
  domainExpiry: z.date().optional(),
  notificationEmail: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  httpMethod: z.enum(['HEAD', 'GET']).optional(),
  httpHeaders: z.string().optional(),
  checkFrequency: z.coerce
    .number()
    .min(60, { message: 'Frequency must be at least 60 seconds.' })
    .max(3600, { message: 'Frequency must be 3600 seconds or less.' })
    .optional()
    .or(z.literal('')),
}).refine(data => {
    if (!data.httpHeaders) {
        return true; // It's optional, so empty is fine
    }
    try {
        const parsed = JSON.parse(data.httpHeaders);
        return typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null;
    } catch (e) {
        return false;
    }
}, {
    message: "Custom headers must be a valid JSON object.",
    path: ["httpHeaders"],
});