import { promises as fs } from 'fs';
import path from 'path';

class ImageHandler {
    constructor() {
        this.supportedFormats = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        this.imagePath = path.join(process.cwd(), 'assets', 'images');
    }

    async initialize() {
        try {
            await fs.access(this.imagePath);
        } catch {
            await fs.mkdir(this.imagePath, { recursive: true });
        }
    }

    async saveImage(attachment, filename) {
        const ext = path.extname(attachment.name).toLowerCase();
        if (!this.supportedFormats.includes(ext)) {
            throw new Error('Unsupported file format');
        }

        const finalPath = path.join(this.imagePath, filename + ext);
        const response = await fetch(attachment.url);
        const buffer = Buffer.from(await response.arrayBuffer());
        
        await fs.writeFile(finalPath, buffer);
        return finalPath;
    }

    async getImage(filename) {
        const files = await fs.readdir(this.imagePath);
        const image = files.find(file => file.startsWith(filename));
        
        if (!image) {
            throw new Error('Image not found');
        }

        return path.join(this.imagePath, image);
    }

    async deleteImage(filename) {
        const imagePath = await this.getImage(filename);
        await fs.unlink(imagePath);
        return true;
    }

    async listImages() {
        const files = await fs.readdir(this.imagePath);
        return files.filter(file => 
            this.supportedFormats.includes(path.extname(file).toLowerCase())
        );
    }
}

export const imageHandler = new ImageHandler();
