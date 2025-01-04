import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = path.join(__dirname, '..');

export function resolveRootPath(...paths) {
    return path.join(rootDir, ...paths);
}

export function resolveConfigPath(...paths) {
    return path.join(rootDir, 'config', ...paths);
}

export function resolveUtilPath(...paths) {
    return path.join(rootDir, 'utils', ...paths);
}

export function resolveDBPath(...paths) {
    return path.join(rootDir, 'data', ...paths);
}

export function resolveFilePath(metaUrl) {
    return dirname(fileURLToPath(metaUrl));
}

export function fileToURL(path) {
    return `file://${path.replace(/\\/g, '/')}`;
}

export function resolveImportPath(path) {
    return new URL(path, import.meta.url).href;
}
