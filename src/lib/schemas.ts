import { z } from 'zod';
export const formSchema = z.object({
  name: z.string().min(1, { message: 'Website name is required.' }),
  url: z.string().url({ message: 'Please enter a valid URL (e.g., https://example.com)' }),
  maintainer: z.string().optional(),
  domainExpiry: z.date().optional(),
});