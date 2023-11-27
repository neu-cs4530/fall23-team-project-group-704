import { DataSource } from 'typeorm';
import Documents from './document';
import Users from './user';
import 'reflect-metadata';
import Permissions from './permissions';

const appDataSource: DataSource = new DataSource({
  type: 'postgres',
  host: 'dpg-clbtekccu2es738mmif0-a.oregon-postgres.render.com',
  ssl: true,
  port: 5432,
  username: 'coveydocs_user',
  password: 'BnMjyOzetiuOg8VECO3gWl5KeYp5w4iZ',
  database: 'coveydocs',
  entities: [Documents, Users, Permissions],
  connectTimeoutMS: undefined,
  synchronize: true,
});

appDataSource.initialize();

export default appDataSource;
