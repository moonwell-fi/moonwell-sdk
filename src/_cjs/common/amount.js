"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Amount = void 0;
class Amount {
    constructor(value, base) {
        Object.defineProperty(this, "_className", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Amount"
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "exponential", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0n
        });
        Object.defineProperty(this, "base", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.base = base;
        if (typeof value === "bigint") {
            this.exponential = value;
            this.value = Number(value) / Number(10n ** BigInt(this.base));
        }
        else {
            this.value = value;
            this.exponential = BigInt(Math.floor(value * 10 ** this.base));
        }
    }
}
exports.Amount = Amount;
//# sourceMappingURL=amount.js.map