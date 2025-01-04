import { exec } from 'child_process';
import { promisify } from 'util';
import { Logger } from '../utils/logger.js';

const execAsync = promisify(exec);
const log = new Logger('SSHManager');

export class SSHManager {
    constructor(config) {
        this.sshConfig = {
            host: config.vps.host,
            username: config.vps.user,
            privateKeyPath: config.vps.keyPath
        };
    }

    async syncFile(localPath, remotePath, direction = 'upload') {
        try {
            const cmd = direction === 'upload'
                ? `scp -i ${this.sshConfig.privateKeyPath} ${localPath} ${this.sshConfig.username}@${this.sshConfig.host}:${remotePath}`
                : `scp -i ${this.sshConfig.privateKeyPath} ${this.sshConfig.username}@${this.sshConfig.host}:${remotePath} ${localPath}`;

            const { stdout, stderr } = await execAsync(cmd);
            
            if (stderr) {
                log.warn(`SSH warning during file sync: ${stderr}`);
            }

            log.info(`File sync successful: ${direction === 'upload' ? 'uploaded' : 'downloaded'}`);
            return true;
        } catch (error) {
            log.error(`File sync failed: ${error.message}`);
            throw error;
        }
    }

    async executeRemote(command) {
        try {
            const cmd = `ssh -i ${this.sshConfig.privateKeyPath} ${this.sshConfig.username}@${this.sshConfig.host} "${command}"`;
            const { stdout, stderr } = await execAsync(cmd);
            
            if (stderr) {
                log.warn(`SSH warning during command execution: ${stderr}`);
            }

            return stdout.trim();
        } catch (error) {
            log.error(`Remote command execution failed: ${error.message}`);
            throw error;
        }
    }
}
