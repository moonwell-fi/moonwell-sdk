export class Amount {
    /**
     * Creates an instance of Amount.
     * This class is helpful with exponential values by creating the amount representation as number and as a bigint, converted using a base.
     * @param value - The value of the amount.
     * @param base - The exponential base of the amount.
     * @returns new Amount class with the value as a number, the exponential number as a bigint and the base used in the conversion
     */
    constructor(value, base) {
        //Used in serialization
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
//# sourceMappingURL=amount.js.map