import * as sqlite3 from "sqlite3";
import { open } from "sqlite";
import { config } from "./../config";
import { NewTokenRecord, CreatorReputation } from "../types";

// New token duplicates tracker
export async function createTableNewTokens(database: any): Promise<boolean> {
  try {
    await database.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time INTEGER NOT NULL,
      name TEXT NOT NULL,
      mint TEXT NOT NULL,
      creator TEXT NOT NULL,
      duplicate_count INTEGER DEFAULT 1,
      is_scam BOOLEAN DEFAULT 0,
      is_rugged BOOLEAN DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS creator_reputation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator TEXT UNIQUE NOT NULL,
      scam_count INTEGER DEFAULT 0,
      rugged_count INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0
    );
  `);
    return true;
  } catch (error: any) {
    return false;
  }
}

// Add a new function to update duplicate count
export async function updateTokenDuplicateCount(name: string | null = null, creator: string | null = null): Promise<void> {
  if (!name && !creator) return;
  
  const db = await open({
    filename: config.db.pathname,
    driver: sqlite3.Database,
  });

  try {
    if (name) {
      await db.run(`
        UPDATE tokens 
        SET duplicate_count = duplicate_count + 1
        WHERE name = ?;
      `, [name]);
    }
    
    if (creator) {
      await db.run(`
        UPDATE tokens 
        SET duplicate_count = duplicate_count + 1
        WHERE creator = ?;
      `, [creator]);
    }
  } catch (error) {
    console.error("Error updating token duplicate count:", error);
  } finally {
    await db.close();
  }
}

// Insert new token with initial status
export async function insertNewToken(newToken: NewTokenRecord) {
  const db = await open({
    filename: config.db.pathname,
    driver: sqlite3.Database,
  });

  // Create Table if not exists
  const newTokensTableExist = await createTableNewTokens(db);
  if (!newTokensTableExist) {
    await db.close();
    return;
  }

  // Proceed with adding token
  if (newTokensTableExist) {
    const { time, name, mint, creator, is_scam = false, is_rugged = false } = newToken;

    try {
      // Begin transaction
      await db.run('BEGIN TRANSACTION');
      
      // Insert token
      await db.run(
        `INSERT INTO tokens (time, name, mint, creator, is_scam, is_rugged)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [time, name, mint, creator, is_scam ? 1 : 0, is_rugged ? 1 : 0]
      );
      
      // Update creator reputation
      const existingCreator = await db.get(
        `SELECT * FROM creator_reputation WHERE creator = ?`,
        [creator]
      );
      
      if (existingCreator) {
        await db.run(
          `UPDATE creator_reputation 
           SET total_tokens = total_tokens + 1
           WHERE creator = ?`,
          [creator]
        );
      } else {
        await db.run(
          `INSERT INTO creator_reputation (creator, total_tokens)
           VALUES (?, 1)`,
          [creator]
        );
      }
      
      // Commit transaction
      await db.run('COMMIT');
    } catch (error) {
      await db.run('ROLLBACK');
      console.error("Error inserting new token:", error);
    } finally {
      await db.close();
    }
  }
}

export async function selectTokenByNameAndCreator(name: string, creator: string): Promise<NewTokenRecord[]> {
  // Open the database
  const db = await open({
    filename: config.db.pathname,
    driver: sqlite3.Database,
  });

  // Create Table if not exists
  const newTokensTableExist = await createTableNewTokens(db);
  if (!newTokensTableExist) {
    await db.close();
    return [];
  }

  // Query the database for matching tokens
  const tokens = await db.all(
    `
    SELECT * 
    FROM tokens
    WHERE name = ? OR creator = ?;
  `,
    [name, creator]
  );

  // Close the database
  await db.close();

  // Return the results
  return tokens;
}

export async function selectTokenByMint(mint: string): Promise<NewTokenRecord[]> {
  // Open the database
  const db = await open({
    filename: config.db.pathname,
    driver: sqlite3.Database,
  });

  // Create Table if not exists
  const newTokensTableExist = await createTableNewTokens(db);
  if (!newTokensTableExist) {
    await db.close();
    return [];
  }

  // Query the database for matching tokens
  const tokens = await db.all(
    `
    SELECT * 
    FROM tokens
    WHERE mint = ?;
  `,
    [mint]
  );

  // Close the database
  await db.close();

  // Return the results
  return tokens;
}

export async function selectAllTokens(): Promise<NewTokenRecord[]> {
  // Open the database
  const db = await open({
    filename: config.db.pathname,
    driver: sqlite3.Database,
  });

  // Create Table if not exists
  const newTokensTableExist = await createTableNewTokens(db);
  if (!newTokensTableExist) {
    await db.close();
    return [];
  }

  // Query the database for matching tokens
  const tokens = await db.all(
    `
    SELECT * 
    FROM tokens;
  `
  );

  // Close the database
  await db.close();

  // Return the results
  return tokens;
}

// Mark a token as scam or rugged and update creator reputation
export async function markTokenAsScamOrRugged(mint: string, isScam: boolean = false, isRugged: boolean = false): Promise<void> {
  const db = await open({
    filename: config.db.pathname,
    driver: sqlite3.Database,
  });

  try {
    // Begin transaction
    await db.run('BEGIN TRANSACTION');
    
    // Get token info
    const token = await db.get(
      `SELECT * FROM tokens WHERE mint = ?`,
      [mint]
    );
    
    if (!token) {
      await db.run('ROLLBACK');
      return;
    }
    
    // Update token status
    await db.run(
      `UPDATE tokens 
       SET is_scam = ?, is_rugged = ?
       WHERE mint = ?`,
      [isScam ? 1 : 0, isRugged ? 1 : 0, mint]
    );
    
    // Update creator reputation
    if (isScam) {
      await db.run(
        `UPDATE creator_reputation 
         SET scam_count = scam_count + 1
         WHERE creator = ?`,
        [token.creator]
      );
    }
    
    if (isRugged) {
      await db.run(
        `UPDATE creator_reputation 
         SET rugged_count = rugged_count + 1
         WHERE creator = ?`,
        [token.creator]
      );
    }
    
    // Commit transaction
    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    console.error("Error marking token as scam or rugged:", error);
  } finally {
    await db.close();
  }
}

// Check if a creator has a history of scam or rugged tokens
export async function checkCreatorReputation(creator: string): Promise<CreatorReputation | null> {
  const db = await open({
    filename: config.db.pathname,
    driver: sqlite3.Database,
  });

  try {
    const reputation = await db.get(
      `SELECT * FROM creator_reputation WHERE creator = ?`,
      [creator]
    );
    
    await db.close();
    return reputation;
  } catch (error) {
    console.error("Error checking creator reputation:", error);
    await db.close();
    return null;
  }
}
