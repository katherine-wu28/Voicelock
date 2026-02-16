import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UserProfile } from './types';

interface VoiceLockDB extends DBSchema {
    profiles: {
        key: string;
        value: UserProfile;
    };
}

const DB_NAME = 'voicelock-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<VoiceLockDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<VoiceLockDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                db.createObjectStore('profiles', { keyPath: 'id' });
            },
        });
    }
    return dbPromise;
}

export const storage = {
    async saveProfile(profile: UserProfile): Promise<void> {
        const db = await getDB();
        await db.put('profiles', profile);
    },

    async getProfile(id: string): Promise<UserProfile | undefined> {
        const db = await getDB();
        return db.get('profiles', id);
    },

    async getAllProfiles(): Promise<UserProfile[]> {
        const db = await getDB();
        return db.getAll('profiles');
    },

    async deleteProfile(id: string): Promise<void> {
        const db = await getDB();
        await db.delete('profiles', id);
    },

    async clearAll(): Promise<void> {
        const db = await getDB();
        await db.clear('profiles');
    }
};
