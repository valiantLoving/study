"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFromUserId = (userId, index) => {
    return +userId.split(/[sp]/)[index];
};
