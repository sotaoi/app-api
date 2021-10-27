"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlers = void 0;
const register_user_handler_1 = require("@app/api/commands/user/register-user-handler");
const update_user_handler_1 = require("@app/api/commands/user/update-user-handler");
const auth_user_handler_1 = require("@app/api/commands/user/auth-user-handler");
const query_all_users_handler_1 = require("@app/api/queries/user/query-all-users-handler");
const retrieve_user_handler_1 = require("@app/api/queries/user/retrieve-user-handler");
const remove_user_handler_1 = require("@app/api/commands/user/remove-user-handler");
const handlers = {
    user: {
        store: register_user_handler_1.RegisterUserHandler,
        update: update_user_handler_1.UpdateUserHandler,
        query: { 'get-all': query_all_users_handler_1.QueryAllUsersHandler },
        retrieve: retrieve_user_handler_1.RetrieveUserHandler,
        remove: remove_user_handler_1.RemoveUserHandler,
        auth: auth_user_handler_1.AuthUserHandler,
    },
};
exports.handlers = handlers;
