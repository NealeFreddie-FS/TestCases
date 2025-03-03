import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { setupDatabase, getDatabase } from "./setup";

// Mock dependencies
jest.mock("sqlite3", () => {
  const mockDb = {
    serialize: jest.fn((callback) => callback()),
    run: jest.fn((query, params, callback) => {
      if (callback) callback(null);
    }),
    close: jest.fn((callback) => {
      if (callback) callback(null);
    }),
  };

  return {
    Database: jest.fn(() => mockDb),
  };
});

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe("Database Setup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  test("setupDatabase should create database and tables", async () => {
    const db = await setupDatabase();

    // Check if Database constructor was called
    expect(sqlite3.Database).toHaveBeenCalled();

    // Check if tables were created
    expect(db.run).toHaveBeenCalledTimes(2);
    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS submissions"),
      expect.anything()
    );
    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS results"),
      expect.anything(),
      expect.any(Function)
    );
  });

  test("getDatabase should return a database connection", async () => {
    const db = await getDatabase();

    // Check if Database constructor was called
    expect(sqlite3.Database).toHaveBeenCalled();
  });

  test("setupDatabase should create data directory if it does not exist", async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await setupDatabase();

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
  });
});
