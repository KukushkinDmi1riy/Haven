import * as config from '../../config.js';
import jwt from 'jsonwebtoken';
import { emailTemplate } from '../helpers/email.js';
import { hashPassword, comparePassword } from '../helpers/auth.js';
import User from '../models/user.js';
import { nanoid } from 'nanoid';
import validator from 'email-validator';

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

    if (!validator.validate(email)) {
      return res.json({ error: 'A valid email is required' });
    }
    if (!password) {
      return res.json({ error: 'Password is required' });
    }

    if (password && password?.length < 6) {
      return res.json({ error: 'Password length must be more then 6 sybmols' });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.json({ error: 'User is taken' });
    }

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
      user,
    });
  } catch (error) {
    console.log(error);
    return res.json({ error: 'Something went wrong!!!!!' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //1.find user
    const user = await User.findOne({ email });

    //2.compare password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({ error: 'Wrong password!' });
    }
    //3.create jwt token

    const token = jwt.sign({ _id: user._id }, config.JWT_SECRETS, {
      expiresIn: '1h',
    });
    const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRETS, {
      expiresIn: '7d',
    });

    //4.send res
    user.password = undefined;
    user.resetCode = undefined;

    return res.json({
      token,
      refreshToken,
      user,
    });
  } catch (error) {
    return res.json({ error: 'Something went wrong. Try again' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.json({ error: 'Could not find user with that email' });
    } else {
      const resetCode = nanoid();

      const token = jwt.sign({ resetCode }, config.JWT_SECRETS, {
        expiresIn: '60m',
      });
      // save to user db
      user.resetCode = resetCode;
      user.save();

      // send email
      config.AWSSES.sendEmail(
        emailTemplate(
          email,
          `
        <p>Please click the link below to access your account.</p>
        <a href="${config.CLIENT_URL}/auth/access-account/${token}">Access my account</a>
    `,
          config.REPLY_TO,
          'Access your account',
        ),
        (err, data) => {
          if (err) {
            return res.json({ error: 'Provide a valid email address' });
          } else {
            return res.json({ error: 'Check email to access your account' });
          }
        },
      );
    }
  } catch (err) {
    console.log(err);
    res.json({ error: 'Something went wrong. Try again.' });
  }
};

export const accessAccount = async (req, res) => {
  try {
    const {resetCode} = jwt.verify(req.body.resetCode, config.JWT_SECRETS);
    const user = await User.findOneAndUpdate({ resetCode }, { resetCode: '' });

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
      user,
    });
  } catch (error) {
    console.log(error);
    res.json({ error: 'Something went wrong. Try again.' });
  }
};
