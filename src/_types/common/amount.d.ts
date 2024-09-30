export declare class Amount {
    _className: string;
    value: number;
    exponential: bigint;
    base: number;
    /**
     * Creates an instance of Amount.
     * This class is helpful with exponential values by creating the amount representation as number and as a bigint, converted using a base.
     * @param value - The value of the amount.
     * @param base - The exponential base of the amount.
     * @returns new Amount class with the value as a number, the exponential number as a bigint and the base used in the conversion
     */
    constructor(value: bigint | number, base: number);
}
//# sourceMappingURL=amount.d.ts.map