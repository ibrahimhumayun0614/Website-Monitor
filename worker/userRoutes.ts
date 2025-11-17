import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, MonitoredSite } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Zenith Watch API
    app.get('/api/sites', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.getSites();
        return c.json({ success: true, data } satisfies ApiResponse<MonitoredSite[]>);
    });
    app.post('/api/sites', async (c) => {
        try {
            const body = await c.req.json<{ url: string }>();
            if (!body.url) {
                return c.json({ success: false, error: 'URL is required' }, 400);
            }
            const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await durableObjectStub.addSite(body.url);
            return c.json({ success: true, data } satisfies ApiResponse<MonitoredSite[]>);
        } catch (e) {
            return c.json({ success: false, error: 'Invalid request body' }, 400);
        }
    });
    app.delete('/api/sites/:id', async (c) => {
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, error: 'ID is required' }, 400);
        }
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.deleteSite(id);
        return c.json({ success: true, data } satisfies ApiResponse<MonitoredSite[]>);
    });
    app.post('/api/sites/:id/recheck', async (c) => {
        const id = c.req.param('id');
        if (!id) {
            return c.json({ success: false, error: 'ID is required' }, 400);
        }
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.recheckSite(id);
        return c.json({ success: true, data } satisfies ApiResponse<MonitoredSite[]>);
    });
}