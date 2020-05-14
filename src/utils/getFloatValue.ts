// https://gist.github.com/mold/42935cb1bdda7ae9b3ec72e9d0fa8666
/**
 * Converts a DataView that represents a 4 byte float (IEEE-11073)
 * to an actual float. Useful for example when reading temperature
 * from a Bluetooth thermometer :)
 *
 * The DataView buffer should contain at least 4 bytes:
 *
 *  [b0, b1, b2, b3]
 *   ^   ^   ^   └---------- Exponent
 *   └---└---└------- Will become the mantissa
 *
 * The offset param determines which byte in the DataView to start
 * from.
 *
 * @param value DataView
 * @param offset number
 */
export function getFloatValue(value: DataView, offset: number) {
  // if the last byte is a negative value (MSB is 1), the final
  // float should be too
  const negative = value.getInt8(offset + 2) >>> 31;
  console.log("offset", value, offset, value.getInt8(offset), value.getUint8(offset));

  // this is how the bytes are arranged in the byte array/DataView
  // buffer
  const [b0, b1, b2, exponent] = [
    // get first three bytes as unsigned since we only care
    // about the last 8 bits of 32-bit js number returned by
    // getUint8().
    // Should be the same as: getInt8(offset) & -1 >>> 24
    value.getUint8(offset),
    value.getUint8(offset + 1),
    value.getUint8(offset + 2),

    // get the last byte, which is the exponent, as a signed int
    // since it's already correct
    value.getInt8(offset + 3),
  ];
  console.log("ints", { b0, b1, b2, exponent });

  let mantissa = b0 | (b1 << 8) | (b2 << 16);
  if (negative) {
    // need to set the most significant 8 bits to 1's since a js
    // number is 32 bits but our mantissa is only 24.
    mantissa |= 255 << 24;
  }

  console.log("mantissa, final", mantissa, mantissa * Math.pow(10, exponent));

  return mantissa * Math.pow(10, exponent);
}
