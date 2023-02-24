import sqlite3 from 'sqlite3';

interface Account {
    id: number;
    username: string;
    password: string;
}

interface Player {
    socialClubId: string;
    playerId: number;
    playerName: string;
    hwid: string;
}

interface Position {
    playerId: number;
    x: number;
    y: number;
    z: number;
}

export class DatabaseHandler {
    private readonly db: sqlite3.Database;

    constructor(filename: string) {
        this.db = new sqlite3.Database(filename);
        this.initialize();
    }

    private initialize() {
        this.db.serialize(() => {
            this.db.run(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password TEXT
        )
      `);

            this.db.run(`
        CREATE TABLE IF NOT EXISTS players (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          socialClubId TEXT UNIQUE,
          playerId INTEGER,
          playerName TEXT,
          hwid TEXT
        )
      `);

            this.db.run(`
        CREATE TABLE IF NOT EXISTS positions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          playerId INTEGER,
          x REAL,
          y REAL,
          z REAL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
        });
    }

    public addAccount(username: string, password: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO accounts (username, password) VALUES (?, ?)', username, password, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    public getAccountByUsername(username: string): Promise<Account | null> {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM accounts WHERE username = ?', username, (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve({
                        id: row.id,
                        username: row.username,
                        password: row.password,
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    public updateAccountPassword(id: number, newPassword: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE accounts SET password = ? WHERE id = ?', newPassword, id, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public deleteAccount(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM accounts WHERE id = ?', id, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public savePlayer(player: Player): Promise<number> {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO players (socialClubId, playerId, playerName, hwid) VALUES (?, ?, ?, ?)',
                player.socialClubId,
                player.playerId,
                player.playerName,
                player.hwid,
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    public savePosition(position: Position): Promise<number> {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO positions (playerId, x, y, z) VALUES (?, ?, ?, ?)',
                position.playerId,
                position.x,
                position.y,
                position.z,
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }
}