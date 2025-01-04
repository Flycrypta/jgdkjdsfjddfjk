import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export function getFilePath(importMetaUrl) {
    return dirname(fileURLToPath(importMetaUrl));
}

export function fileToURL(filePath) {
    return new URL(`file://${filePath}`).toString();
}

export function resolveRootPath(...paths) {
    const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
    return join(rootDir, ...paths);
}

export function resolveDataPath(...paths) {
    return resolveRootPath('data', ...paths);
}

export function resolveConfigPath(...paths) {
    return resolveRootPath('config', ...paths);
}
