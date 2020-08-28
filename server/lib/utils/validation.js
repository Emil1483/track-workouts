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
exports.validate = exports.workoutSchema = exports.setSchema = void 0;
const yup = __importStar(require("yup"));
const array_utils_1 = require("./array_utils");
const PASSWORD = process.env.PASSWORD || '123';
exports.setSchema = yup.object({
    reps: yup.number().integer().positive().optional(),
    weight: yup.number().positive().optional(),
    preBreak: yup.number().positive().optional(),
    bodyMass: yup.number().positive().optional(),
    bandLevel: yup.number().integer().positive().optional(),
    time: yup.number().positive().optional(),
});
exports.workoutSchema = yup.object({
    password: yup.string().required(),
    date: yup.date().required(),
    exercises: yup.array().required().of(yup.object({
        name: yup.string().required(),
        sets: yup.array().of(exports.setSchema).min(1).required(),
    })),
});
async function validate(body) {
    if (body.password != PASSWORD)
        throw new Error('incorrect password');
    await exports.workoutSchema.validate(body);
    const setFields = Object.keys(exports.setSchema.fields);
    body.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            const keys = Object.keys(set);
            if (keys.length == 0)
                throw new Error(`${exercise.name} contains an empty set`);
            keys.forEach(key => {
                if (!array_utils_1.contains(setFields, key))
                    throw new Error(`${key} in ${exercise.name} is not a supported attribute`);
            });
        });
    });
}
exports.validate = validate;
