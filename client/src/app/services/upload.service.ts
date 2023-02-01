import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UploadService {
    constructor() {}
    expectedWidth: number = 640;
    expectedHeight: number = 480;
    valid: boolean = true;

    async validate(files: File[]): Promise<boolean> {
        return (await this.validateDim(files)) && this.validateFormat(files);
    }
    async validateDim(files: File[]): Promise<boolean> {
        this.valid = true;
        const promises: Array<Promise<void>> = [];
        for (const file of files) {
            const reader = new FileReader();
            const promise = new Promise<void>((resolve) => {
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const img = new Image();
                    img.src = reader.result as string;
                    let width: number = 0;
                    let height: number = 0;
                    img.onload = () => {
                        height = img.naturalHeight;
                        width = img.naturalWidth;
                        if (height != this.expectedHeight || width != this.expectedWidth) {
                            this.valid = false;
                        }
                        resolve();
                    };
                };
            });
            promises.push(promise);
        }
        return Promise.all(promises).then(() => {
            return this.valid;
        });
    }
    validateFormat(files: File[]): boolean {
        for (const file of files) {
            if (!file.name.endsWith('.bmp') && file.size) {
                return false;
            }
        }
        return true;
    }
}
