export class Amount {
  //Used in serialization
  public _className = "Amount";
  public value = 0;
  public exponential = 0n;
  public base = 0;

  /**
   * Creates an instance of Amount.
   * This class is helpful with exponential values by creating the amount representation as number and as a bigint, converted using a base.
   * @param value - The value of the amount.
   * @param base - The exponential base of the amount.
   * @returns new Amount class with the value as a number, the exponential number as a bigint and the base used in the conversion
   */
  constructor(value: bigint | number, base: number) {
    this.base = base;
    if (typeof value === "bigint") {
      this.exponential = value;
      this.value = Number(value) / Number(10n ** BigInt(this.base));
    } else {
      this.value = value;
      this.exponential = BigInt(Math.floor(value * 10 ** this.base));
    }
  }

  public toString() {
    return this.value.toFixed(this.base);
  }

  public toBigString() {
    return this.exponential.toString();
  }
}
