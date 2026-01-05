import { Request, Response } from 'express';
import * as messageService from './message.service';

interface AuthRequest extends Request {
    user?: any;
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const sender_id = req.user.id;
        const { receiver_id, listing_id, content } = req.body;
        const message = await messageService.sendMessage(sender_id, receiver_id, listing_id, content);
        res.status(201).json(message);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const messages = await messageService.getConversations(req.user.id);
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getThread = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { partner_id, listing_id } = req.query;
        
        if (!partner_id || !listing_id) {
             // return res.status(400).json({ error: 'Missing partner_id or listing_id' }); 
             // Typescript void return issue fix
             res.status(400).json({ error: 'Missing partner_id or listing_id' });
             return;
        }

        const thread = await messageService.getThread(userId, partner_id as string, listing_id as string);
        res.json(thread);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
