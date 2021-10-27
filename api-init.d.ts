import { AppKernel } from '@sotaoi/api/app-kernel';
import { AuthRecord } from '@sotaoi/omni/artifacts';
import { ResponseToolkit } from '@hapi/hapi';
declare class ApiInit {
    private static _kernel;
    static kernel(): AppKernel;
    static registerInputs(): void;
    static setTokenTtlInMilliseconds(tokenTtl: number, shortTokenTtl: number): void;
    static translateAccessToken(handler: ResponseToolkit, accessToken: null | string): Promise<[null | AuthRecord, null | string]>;
    static deauth(handler: ResponseToolkit): Promise<void>;
}
export { ApiInit };
