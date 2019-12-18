import {BaseOperation} from "../model";
import {Readable} from "stream";
import {StreamHelper} from "../../helper/streamHelper";
import {FormHelper} from "../../helper/form";
import {FFMPEGHelper} from "../../helper/ffmpegHelper";

export default class ResizeVideoOperation extends BaseOperation{

    getTypes(): string[] {
        return ['resize-video', 'resizes-video'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const buffer = await StreamHelper.toBuffer(readable);
        const fileType = FormHelper.guessFileType(buffer, this.request.path);
        return FFMPEGHelper.resize(buffer, fileType.ext, {resize : this.value}, this.response);
    }
}