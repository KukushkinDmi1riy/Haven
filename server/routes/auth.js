import express from 'express';

import * as auth from '../controllers/auth.js';
import { requireSignin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', requireSignin, auth.welcome);
router.post('/pre-register', auth.preRegister);
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/access-account', auth.accessAccount);






export default router;