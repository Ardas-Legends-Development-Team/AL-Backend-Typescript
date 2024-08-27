import { DataSource } from 'typeorm';
import { Faction } from './domain/entities/Faction';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'skreet',
    database: 'ardaslegends',
    synchronize: true,
    logging: true,
    entities: [Faction],
    subscribers: [],
    migrations: [],
});
