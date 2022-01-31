import { libC } from '@cloudmagick/lib-c';
import { serviceA } from './service/service-a';

console.log(`Running ${serviceA()} with dependencies: ${libC()}`);
