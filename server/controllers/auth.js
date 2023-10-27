import * as config from '../../config.js';
import jwt from 'jsonwebtoken';
import { emailTemplate } from '../helpers/email.js';
import { hashPassword, comparePassword } from '../helpers/auth.js';
import User from '../models/user.js';
import { nanoid } from 'nanoid';

export const welcome = (req, res) => {
  res.json({
    data: 'hello from nodejs api from routes yay',
  });
};

export const preRegister = async (req, res) => {
  // create jwt with email and password then email as clickable link
  // only when user click on that email link, registeration completes
  try {
    const { email, password } = req.body;
    const token = jwt.sign({ email, password }, config.JWT_SECRETS, { expiresIn: '1h' });

    config.AWSSES.sendEmail(
      emailTemplate(
        email,
        `
		<p> Pleace click to the link below</p>
		<a href="${config.CLIENT_URL}/auth/account-activate/${token}"> Active my account</a> 
		`,
        config.REPLY_TO,
        'Acivate your account',
      ),
      (err, data) => {
        if (err) {
          console.log(err);
          return res.json({ ok: false });
        } else {
          console.log(data);
          return res.json({ ok: true });
        }
      },
    );
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Something went wrong. Try again.' });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password } = jwt.verify(req.body.token, config.JWT_SECRETS);

    const hashedPassword = await hashPassword(password);

    const user = await new User({
      username: nanoid(6),
      email,
      password: hashedPassword,
    }).save();

    const token = jwt.sign({ _id: user._id }, config.JWT_SECRETS, {
      expiresIn: '1h',
    });

    const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRETS, {
      expiresIn: '7d',
    });

	user.password = undefined;
	user.resetCode = undefined;

	return res.json({
		token,
		refreshToken,
		user
	})
  } catch (error) {
    console.log(error);
    return res.json({ error: 'Something went wrong!!!!!' });
  }
};
