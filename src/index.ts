import app from './app';
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import * as console from 'node:console';

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3006;

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
        // Your application logic here
    })
    .catch((err: Error) => {
        console.error('Error during Data Source initialization:', err);
    });
app.listen({ port: FASTIFY_PORT }).then((r) => console.log(r));

console.log(
    `🚀  Fastify server running on port http://localhost:${FASTIFY_PORT}`,
);
console.log(`Route index: /`);
console.log(`Route user: /api/v1/user`);
