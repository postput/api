import {merge} from "lodash";

export interface SharpConfig
{
    limit_input_pixels: number;
}

const baseConfig = require('./json/sharp.json');

const envConfig = {
    limit_input_pixels: process.env.LIMIT_INPUT_PIXELS,
};

const sharpConfig : SharpConfig = merge(baseConfig, envConfig);
export default  sharpConfig ;
