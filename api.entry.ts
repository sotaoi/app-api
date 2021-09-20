process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
process.env.SIGNATURE_1 = process.env.DB_NAME;
process.env.SIGNATURE_2 = process.env.DB_CONTROL_PANEL_NAME;

import { main } from '@app/api/main';

main(false);
