import {BaseOperation} from "../model";
import {Readable} from "stream";
import {StreamHelper} from "../../helper/streamHelper";
import {FormHelper} from "../../helper/form";
import {FFMPEGHelper} from "../../helper/ffmpegHelper";

export default class CropVideoOperation extends BaseOperation{

    getTypes(): string[] {
        return ['crop-video', 'crops-video', 'cropped-video'];
    }

    async apply(readable: Readable): Promise<Readable> {
        const buffer = await StreamHelper.toBuffer(readable);
        const fileType = FormHelper.guessFileType(buffer, this.request.path);
        return FFMPEGHelper.crop(buffer, fileType.ext, {crop : this.value}, this.response);
    }
}