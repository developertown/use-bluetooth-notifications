// https://gist.github.com/mold/42935cb1bdda7ae9b3ec72e9d0fa8666

function buf2hex(buffer: ArrayBuffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}

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
export const getFloatValue = (value: DataView, offset = 0): number => {
  const buffer = new ArrayBuffer(5);
  const dv = new DataView(buffer);
  dv.setUint32(offset, 0x00016c);
  const val = value;
  // value = dv;
  console.log("32", value, val, val.getUint32(offset), buf2hex(value.buffer), buf2hex(val.buffer));
  // if the last byte is a negative value (MSB is 1), the final
  // float should be too
  const negative = value.getInt8(offset + 2) >>> 31;

  // this is how the bytes are arranged in the byte array/DataView
  // buffer
  const [config, exponent, b0, b1, b2] = [
    // get the config byte
    value.getInt8(offset),

    // get the second byte, which is the exponent, as a signed int
    // since it's already correct
    value.getInt8(offset + 1),

    // get last three bytes as unsigned since we only care
    // about the last 8 bits of 32-bit js number returned by
    // getUint8().
    // Should be the same as: getInt8(offset) & -1 >>> 24
    value.getUint8(offset + 2),
    value.getUint8(offset + 3),
    value.getUint8(offset + 4),
  ];

  let mantissa = b2 | (b1 << 8) | (b0 << 16);
  console.log("exponent:", exponent, { mantissa, b0, b1, b2 });
  if (negative) {
    // need to set the most significant 8 bits to 1's since a js
    // number is 32 bits but our mantissa is only 24.
    mantissa |= 255 << 24;
  }

  return mantissa * Math.pow(10, exponent);
};

export function parseIeee11073(value: DataView, offset = 0): number {
  const buffer = new ArrayBuffer(5);
  const dv = new DataView(buffer);
  dv.setUint32(offset, 0x06c10ff);
  const val = value;
  value = dv;
  // if the last byte is a negative value (MSB is 1), the final
  // float should be too
  const negative = value.getInt8(offset + 2) >>> 31;

  // this is how the bytes are arranged in the byte array/DataView
  // buffer
  const [exponent, b0, b1, b2] = [
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

  let mantissa = b2 | (b1 << 8) | (b0 << 16);
  if (negative) {
    // need to set the most significant 8 bits to 1's since a js
    // number is 32 bits but our mantissa is only 24.
    mantissa |= 255 << 24;
  }

  console.log("exponent:", exponent);
  return mantissa * Math.pow(10, exponent);
}
