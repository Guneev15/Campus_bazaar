import { Request, Response } from 'express';
import * as aiService from './ai.service';

export const generateListing = async (req: Request, res: Response) => {
  try {
    console.log('AI Generation Request Received');
    console.log('File:', req.file ? 'Present' : 'Missing');
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const { title, condition } = req.body;
    
    // Process image
    const result = await aiService.generateListingInfo(
      req.file.buffer, // Buffer from multer
      req.file.mimetype,
      title || 'Unknown Item',
      condition || 'Used'
    );

    res.json(result);
  } catch (error: any) {
    const errorLog = `
[${new Date().toISOString()}] AI Controller Error:
${error.stack || error.message}
----------------------------------------
`;
    require('fs').appendFileSync('server_error.log', errorLog);
    
    console.error('AI Controller Error - Full Stack:', error);
    res.status(500).json({ error: error.message || 'AI Generation failed' });
  }
};
