"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("@app/api/main");
main_1.main(false);
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
