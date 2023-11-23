import { DataSource } from 'typeorm';
import Document from './document';
import User from './user';
import 'reflect-metadata';

const appDataSource: DataSource = new DataSource({
  type: 'postgres',
  host: 'dpg-clbtekccu2es738mmif0-a.oregon-postgres.render.com',
  ssl: true,
  port: 5432,
  username: 'coveydocs_user',
  password: 'BnMjyOzetiuOg8VECO3gWl5KeYp5w4iZ',
  database: 'coveydocs',
  entities: [Document, User],
  connectTimeoutMS: undefined,
});

appDataSource.initialize();

export default appDataSource;
