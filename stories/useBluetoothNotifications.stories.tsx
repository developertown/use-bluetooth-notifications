import React from "react";
import BluetoothDisplay from "../example/bluetooth-display";
import { HEALTH_THERMOMETER_UUID, TEMPERATURE_MEASUREMENT_UUID } from "../src/types/Bluetooth";

export default {
  title: "useBluetoothNotifications",
  component: BluetoothDisplay,
};

export const thermometer = () => (
  <BluetoothDisplay serviceUuid={HEALTH_THERMOMETER_UUID} characteristicUuid={TEMPERATURE_MEASUREMENT_UUID} />
);
// export const customService = () => <BluetoothDisplay serviceUuid="0xffe0" />;
