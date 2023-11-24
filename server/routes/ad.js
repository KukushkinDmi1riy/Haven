import express from 'express';

import * as ad from '../controllers/ad.js';
import { requireSignin } from '../middlewares/auth.js';

const router = express.Router();

router.post('/upload-image', requireSignin, ad.uploadImage);
router.post('/remove-image', requireSignin, ad.removeImage);


export default router;