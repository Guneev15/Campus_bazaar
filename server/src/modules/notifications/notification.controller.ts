import { Request, Response } from 'express';
import * as notificationService from './notification.service';

export const getMyNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notifications = await notificationService.getUserNotifications(userId);
        res.json(notifications);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const markRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const updated = await notificationService.markAsRead(id, userId);
        if (!updated) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const markAllRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await notificationService.markAllAsRead(userId);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
