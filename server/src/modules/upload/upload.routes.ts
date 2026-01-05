import { Router } from 'express';
import { upload } from './upload.middleware';

const router = Router();

router.post('/', upload.single('image'), (req: any, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No image uploaded' });
        return;
    }

    // Cloudinary returns the path in `req.file.path`
    if (!req.file || !(req.file as any).path) {
         res.status(500).json({ error: 'Image upload failed' });
         return;
    }

    // Cloudinary URL is absolute (https://...)
    // We don't need to append localhost anymore
    res.json({ url: (req.file as any).path });
});

export default router;
