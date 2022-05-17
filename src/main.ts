import { Summer } from './core/Summer';
import './modules/Modules';

const summer = new Summer('#app', { debug: true, modelType: 'DataProvider' });

console.log('summer >> ', summer);