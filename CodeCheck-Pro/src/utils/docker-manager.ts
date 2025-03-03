import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Utility class for managing Docker containers for code execution
 */
export class DockerManager {
  private readonly tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), "temp");
    this.ensureTempDirExists();
  }

  /**
   * Ensure the temporary directory exists
   */
  private ensureTempDirExists(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Execute Python code in a Docker container
   * @param code The Python code to execute
   * @param timeout Timeout in milliseconds
   * @returns Promise with execution result
   */
  public async executePythonCode(
    code: string,
    timeout = 5000
  ): Promise<string> {
    const executionId = uuidv4();
    const filePath = path.join(this.tempDir, `${executionId}.py`);

    try {
      // Write code to temporary file
      fs.writeFileSync(filePath, code);

      // Execute code in Docker container
      return await this.executeInContainer(
        "codecheck-python",
        filePath,
        "python",
        timeout
      );
    } finally {
      // Clean up temporary file
      this.cleanupFile(filePath);
    }
  }

  /**
   * Execute JavaScript code in a Docker container
   * @param code The JavaScript code to execute
   * @param timeout Timeout in milliseconds
   * @returns Promise with execution result
   */
  public async executeJavaScriptCode(
    code: string,
    timeout = 5000
  ): Promise<string> {
    const executionId = uuidv4();
    const filePath = path.join(this.tempDir, `${executionId}.js`);

    try {
      // Write code to temporary file
      fs.writeFileSync(filePath, code);

      // Execute code in Docker container
      return await this.executeInContainer(
        "codecheck-javascript",
        filePath,
        "node",
        timeout
      );
    } finally {
      // Clean up temporary file
      this.cleanupFile(filePath);
    }
  }

  /**
   * Execute a file in a Docker container
   * @param containerName The name of the Docker container
   * @param filePath The path to the file to execute
   * @param command The command to execute the file
   * @param timeout Timeout in milliseconds
   * @returns Promise with execution result
   */
  private executeInContainer(
    containerName: string,
    filePath: string,
    command: string,
    timeout: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileName = path.basename(filePath);
      const dockerCommand = `docker exec ${containerName} ${command} /code/${fileName}`;

      // Set timeout to prevent infinite execution
      const timeoutId = setTimeout(() => {
        reject(new Error("Execution timed out"));
      }, timeout);

      exec(dockerCommand, (error, stdout, stderr) => {
        clearTimeout(timeoutId);

        if (error && error.code !== 0) {
          // Return stderr as the result for compilation/runtime errors
          resolve(stderr || error.message);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Clean up a temporary file
   * @param filePath The path to the file to clean up
   */
  private cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error cleaning up file ${filePath}:`, error);
    }
  }

  /**
   * Check if Docker containers are running
   * @returns Promise<boolean> True if containers are running
   */
  public async checkContainersRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      exec('docker ps --format "{{.Names}}"', (error, stdout) => {
        if (error) {
          resolve(false);
          return;
        }

        const runningContainers = stdout.split("\n");
        const pythonRunning = runningContainers.includes("codecheck-python");
        const jsRunning = runningContainers.includes("codecheck-javascript");

        resolve(pythonRunning && jsRunning);
      });
    });
  }

  /**
   * Start Docker containers if they're not running
   * @returns Promise<boolean> True if containers are started successfully
   */
  public async startContainersIfNeeded(): Promise<boolean> {
    const containersRunning = await this.checkContainersRunning();

    if (containersRunning) {
      return true;
    }

    return new Promise((resolve) => {
      exec("docker-compose up -d", (error) => {
        resolve(!error);
      });
    });
  }
}
