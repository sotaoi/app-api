import { config } from '@app/omni/config';
config('');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.SIGNATURE_1 = process.env.DB_NAME;
process.env.SIGNATURE_2 = process.env.DB_CONTROL_PANEL_NAME;
import { main } from '@app/api/main';

main(false);

// import { config } from '@app/omni/config';
// config('');
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// process.env.SIGNATURE_1 = process.env.DB_NAME;
// process.env.SIGNATURE_2 = process.env.DB_CONTROL_PANEL_NAME;
// import cluster from 'cluster';
// import { main } from '@app/api/main';

// if (cluster.isMaster) {
//   for (let i = 0; i < 3; i++) {
//     cluster.fork();
//   }

//   Object.keys(cluster.workers).map((id) => {
//     console.info(`Cluster worker running with process ID "${cluster.workers[id]?.process.pid}"`);
//   });

//   cluster.on('exit', function (worker, code, signal) {
//     console.info(`Cluster worker with process ID "${worker.process.pid}" died`);
//   });
// } else {
//   main(false);
// }
