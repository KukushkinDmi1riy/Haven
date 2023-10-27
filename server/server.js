import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';

import { DATABASE } from '../config.js';
import authRoutes from './routes/auth.js';

const app = express();

//db
mongoose.set('strictQuery', false);
mongoose
  .connect(DATABASE)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('error'));

//middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

//routes middleware
app.use('/api', authRoutes);


app.listen(8081, () => {
  console.log('Server on port 8081');
});
