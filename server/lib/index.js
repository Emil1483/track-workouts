"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const monk_1 = __importDefault(require("monk"));
const db = monk_1.default('localhost/track-workouts');
const workouts = db.get('workouts');
const app = express_1.default();
app.use(cors_1.default());
app.use(morgan_1.default('tiny'));
app.use(body_parser_1.json());
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));
