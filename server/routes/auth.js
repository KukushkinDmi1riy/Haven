import express from 'express';

import * as auth from '../controllers/auth.js';

const router = express.Router();

router.get('/', auth.welcome);
router.post('/pre-register', auth.preRegister);
router.post('/register', auth.register);



export default router;