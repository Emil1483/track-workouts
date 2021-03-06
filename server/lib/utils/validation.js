"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGetWorkouts = exports.validateDelete = exports.validatePost = void 0;
const yup = __importStar(require("yup"));
const array_utils_1 = require("./array_utils");
const error_utils_1 = require("./error_utils");
const PASSWORD = process.env.PASSWORD || '123';
const attributeSchema = yup.number().positive().optional();
const setSchema = yup.object({
    reps: attributeSchema,
    weight: attributeSchema,
    preBreak: attributeSchema,
    bodyMass: attributeSchema,
    bandLevel: attributeSchema,
    time: attributeSchema,
});
const workoutSchema = yup.object({
    password: yup.string().required(),
    date: yup.date().required(),
    exercises: yup.array().of(yup.object({
        name: yup.string().min(1).required(),
        sets: yup.array().of(setSchema).min(1).required(),
    })),
});
async function validatePost(body) {
    if (body.password != PASSWORD)
        throw error_utils_1.incorrectPassword;
    await workoutSchema.validate(body);
    const setFields = Object.keys(setSchema.fields);
    body.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            const attributes = Object.keys(set);
            if (attributes.length == 0)
                throw error_utils_1.hasEmptySet(exercise);
            attributes.forEach(attribute => {
                if (!array_utils_1.contains(setFields, attribute))
                    throw error_utils_1.notSupportedAttribute(attribute, exercise);
            });
        });
    });
}
exports.validatePost = validatePost;
const deleteSchema = yup.object({
    password: yup.string().required(),
    date: yup.date().required(),
    exercises: yup.array().optional().min(1).of(yup.string().min(1)),
});
async function validateDelete(body) {
    if (body.password != PASSWORD)
        throw error_utils_1.incorrectPassword;
    await deleteSchema.validate(body);
}
exports.validateDelete = validateDelete;
const getWorkoutsSchema = yup.object({
    limit: yup.number().positive().max(62).default(31),
    sort: yup.string().oneOf(['ascending', 'descending']).default('descending'),
    to: yup.date().optional(),
});
async function validateGetWorkouts(query) {
    const options = await getWorkoutsSchema.validate(query);
    const result = {};
    const optionsFields = Object.keys(getWorkoutsSchema.fields);
    optionsFields.forEach(optionField => {
        if (options[optionField] != null) {
            result[optionField] = options[optionField];
        }
    });
    return result;
}
exports.validateGetWorkouts = validateGetWorkouts;
