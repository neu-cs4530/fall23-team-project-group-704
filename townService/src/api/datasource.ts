import { DataSource } from 'typeorm';

const appDataSource: DataSource = new DataSource({
  type: 'postgres',
  host: 'dpg-clbtekccu2es738mmif0-a',
  port: 5432,
  username: 'coveydocs_user',
  password: 'BnMjyOzetiuOg8VECO3gWl5KeYp5w4iZ',
  database: 'coveydocs',
});

export default appDataSource;

appDataSource.initialize();
