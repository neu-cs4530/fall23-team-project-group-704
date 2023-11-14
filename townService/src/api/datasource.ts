import { DataSource } from 'typeorm';

const appDataSource: DataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 3306,
  username: 'test',
  password: 'test',
  database: 'test',
});

export default appDataSource;

appDataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch(err => {
    console.error('Error during Data Source initialization', err);
  });
