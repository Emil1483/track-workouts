import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { json } from 'body-parser';
import cors from 'cors';
import monk from 'monk';
import * as yup from 'yup';

const db = monk('localhost/track-workouts');
const workouts = db.get('workouts');

const app = express();

app.use(cors());
app.use(morgan('tiny'));
app.use(json());

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));