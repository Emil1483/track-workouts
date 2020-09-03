import * as yup from 'yup';
import { contains } from './array_utils'
import { incorrectPassword, hasEmptySet, notSupportedAttribute } from './error_utils';

const PASSWORD = process.env.PASSWORD || '123';

const setSchema = yup.object({
    reps: yup.number().integer().positive().optional(),
    weight: yup.number().positive().optional(),
    preBreak: yup.number().positive().optional(),
    bodyMass: yup.number().positive().optional(),
    bandLevel: yup.number().integer().positive().optional(),
    time: yup.number().positive().optional(),
});

const workoutSchema = yup.object({
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
    exercises: Array<Exercise>;
}

export interface Exercise {
    name: string;
    sets: Array<any>;
}

export async function validatePost(body: PostReqBody) {
    if (body.password != PASSWORD) throw incorrectPassword;

    await workoutSchema.validate(body);

    const setFields = Object.keys(setSchema.fields as Object);
    body.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            const attributes = Object.keys(set);
            if (attributes.length == 0) throw hasEmptySet(exercise);
            attributes.forEach(attribute => {
                if (!contains(setFields, attribute)) throw notSupportedAttribute(attribute, exercise);
            });
        });
    });
}

const deleteSchema = yup.object({
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
    if (body.password != PASSWORD) throw incorrectPassword;
    await deleteSchema.validate(body);
}

const getWorkoutsSchema = yup.object({
    limit: yup.number().positive().max(62).default(31),
    sort: yup.string().oneOf(['ascending', 'descending']).default('descending'),
    to: yup.date().optional(),
});

export interface GetWorkoutsQuery {
    limit: number;
    sort: 'ascending' | 'descending';
    to?: Date;
}

export async function validateGetWorkouts(query: GetWorkoutsQuery): Promise<GetWorkoutsQuery> {
    const options = await getWorkoutsSchema.validate(query) as any;

    const result: any = {};
    const optionsFields = Object.keys(getWorkoutsSchema.fields as Object);
    optionsFields.forEach(optionField => {
        if (options[optionField] != null) {
            result[optionField] = options[optionField];
        }
    });
    return result;
}