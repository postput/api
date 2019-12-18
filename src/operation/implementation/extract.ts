import {BaseOperation} from "../model";
import {Readable} from "stream";
import {StreamHelper} from "../../helper/streamHelper";
import {FormHelper} from "../../helper/form";
import {FFMPEGHelper} from "../../helper/ffmpegHelper";

export default class ExtractOperation extends BaseOperation{

    getTypes(): string[] {
        return ['extract', 'extracts'];
    }

    async apply(readable: Readable): Promise<Readable> {
        let extractValues = this.value.split(',').map(val => parseInt(val));
        const buffer = await StreamHelper.toBuffer(readable);
        const fileType = FormHelper.guessFileType(buffer, this.request.path);
        return FFMPEGHelper.extract(buffer, fileType.ext, {start : extractValues[0], duration: extractValues[1]}, this.response);
    }
}