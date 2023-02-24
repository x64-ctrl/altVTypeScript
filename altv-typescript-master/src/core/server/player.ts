import * as alt from 'alt-server';
import { DatabaseHandler } from './database';
import {Player} from "alt-server";

const dbPath = './mydatabase.sqlite';
const dbHandler = new DatabaseHandler(dbPath);

alt.on('playerConnect', async (player) => {
    const socialClubId = player.socialID;

    const dbPlayer = await dbHandler.getAccountByUsername(socialClubId);

    if (!dbPlayer) {
        const newPlayer = {
            socialClubId,
            name: player.name,
            hwid: player.hwidHash,
        };

        const playerId = await dbHandler.savePlayer();
        alt.log(`Player ${player.name} (ID: ${player.id}) added to database with ID ${playerId}`);
    } else {
        alt.log(`Player ${player.name} (ID: ${player.id}) loaded from database with ID ${dbPlayer.id}`);
    }

    // Emit the player's position to the database every 10 seconds
    setInterval(async () => {
        const pos = player.pos;
        const position = {
            playerId: dbPlayer.id,
            x: pos.x,
            y: pos.y,
            z: pos.z,
        };
        await dbHandler.savePosition(position);
    }, 10000);
});

alt.on('playerDisconnect', async (player) => {
    alt.log(`Player ${player.name} (ID: ${player.id}) disconnected from the server`);
});
