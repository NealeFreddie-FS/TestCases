import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

/**
 * Interface for quiz answer key
 */
export interface AnswerKey {
  [questionId: string]: string;
}

/**
 * Utility class for parsing CSV files for quiz answer keys
 */
export class CSVParser {
  /**
   * Parse a CSV file into an answer key object
   * @param filePath Path to the CSV file
   * @returns Promise with the answer key object
   */
  public static async parseAnswerKeyFile(filePath: string): Promise<AnswerKey> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          reject(new Error(`Error reading CSV file: ${err.message}`));
          return;
        }

        try {
          const answerKey = this.parseCSVData(data);
          resolve(answerKey);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Parse CSV data into an answer key object
   * @param csvData CSV data as a string
   * @returns Answer key object
   */
  public static parseCSVData(csvData: string): AnswerKey {
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const answerKey: AnswerKey = {};

    // Check if the CSV has the expected format
    if (records.length === 0) {
      throw new Error("CSV file is empty or has invalid format");
    }

    // Check if the first record has questionId and correctAnswer columns
    const firstRecord = records[0];
    if (!("questionId" in firstRecord) || !("correctAnswer" in firstRecord)) {
      throw new Error(
        "CSV file must have questionId and correctAnswer columns"
      );
    }

    // Parse records into answer key object
    for (const record of records) {
      const { questionId, correctAnswer } = record;

      if (!questionId || !correctAnswer) {
        continue; // Skip invalid records
      }

      answerKey[questionId] = correctAnswer;
    }

    return answerKey;
  }

  /**
   * Save uploaded file to the uploads directory
   * @param fileBuffer File buffer
   * @param originalFilename Original filename
   * @returns Path to the saved file
   */
  public static async saveUploadedFile(
    fileBuffer: Buffer,
    originalFilename: string
  ): Promise<string> {
    const uploadsDir = path.join(process.cwd(), "uploads");

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(originalFilename);
    const filename = `${path.basename(
      originalFilename,
      fileExtension
    )}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, filename);

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, fileBuffer, (err) => {
        if (err) {
          reject(new Error(`Error saving file: ${err.message}`));
          return;
        }

        resolve(filePath);
      });
    });
  }

  /**
   * Generate a sample answer key CSV file
   * @returns CSV content as a string
   */
  public static generateSampleAnswerKeyCSV(): string {
    return `questionId,correctAnswer
q1,Paris
q2,42
q3,1492
q4,H2O
q5,Jupiter`;
  }
}
