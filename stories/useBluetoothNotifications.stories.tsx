import React from "react";
import BluetoothDisplay from "../src/examples/bluetooth-display";

export default {
  title: "useBluetoothNotifications",
  component: BluetoothDisplay,
};

export const thermometer = () => (
  <BluetoothDisplay serviceUuid={"health_thermometer"} characteristicUuid={"temperature_measurement"} />
);
// export const customService = () => <BluetoothDisplay serviceUuid="0xffe0" />;
