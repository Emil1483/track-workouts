import * as yup from 'yup';
import { contains } from './array_utils'

const PASSWORD = process.env.PASSWORD || '123';

export const setSchema = yup.object({
    reps: yup.number().integer().positive().optional(),
    weight: yup.number().positive().optional(),
    preBreak: yup.number().positive().optional(),
    bodyMass: yup.number().positive().optional(),
    bandLevel: yup.number().integer().positive().optional(),
    time: yup.number().positive().optional(),
});

export const workoutSchema = yup.object({
    password: yup.string().required(),
    date: yup.date().required(),
    exercises: yup.array().required().of(
        yup.object({
            name: yup.string().min(1).required(),
            sets: yup.array().of(setSchema).min(1).required(),
        }),
    ),
});

export interface PostReqBody {
    password: string;
    date: string;
    exercises: Array<{
        name: string;
        sets: Array<any>;
    }>;
}

export async function validatePost(body: PostReqBody) {
    if (body.password != PASSWORD) throw new Error('incorrect password');

    await workoutSchema.validate(body);

    const setFields = Object.keys(setSchema.fields as Object);
    body.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            const keys = Object.keys(set);
            if (keys.length == 0) throw new Error(`${exercise.name} contains an empty set`);
            keys.forEach(key => {
                if (!contains(setFields, key)) throw new Error(`${key} in ${exercise.name} is not a supported attribute`);
            });
        });
    });
}

export const deleteSchema = yup.object({
    password: yup.string().required(),
    date: yup.date().required(),
    exercises: yup.array().optional().min(1).of(
        yup.string().min(1),
    ),
});

export interface DeleteReqBody {
    password: string;
    date: string;
    exercises?: Array<string>;
}

export async function validateDelete(body: DeleteReqBody) {
    if (body.password != PASSWORD) throw new Error('incorrect password');
    await deleteSchema.validate(body);
}