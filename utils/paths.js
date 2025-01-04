import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(dirname(__filename));

export function resolveRootPath(...paths) {
    return join(rootDir, ...paths);
}

export function resolveConfigPath(...paths) {
    return join(rootDir, 'config', ...paths);
}

export function resolveUtilPath(...paths) {
    return join(rootDir, 'utils', ...paths);
}

// New function to convert paths to URL format
export function pathToFileURL(path) {
    return new URL(`file://${path}`).href;
}

// New function for database paths
export function resolveDBPath(...paths) {
    return join(rootDir, 'data', ...paths);
}

// New function to ensure proper URL formatting for imports
export function formatImportPath(path) {
    return new URL(path, import.meta.url).href;
}
