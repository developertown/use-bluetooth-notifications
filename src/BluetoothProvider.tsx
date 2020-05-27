import * as React from "react";
import { BluetoothNotificationsHookOptions } from "./types/Bluetooth";
import { BluetoothContext } from "./BluetoothContext";
import { useBluetoothNotifications } from "./useBluetoothNotifications";

export const BluetoothProvider: React.FC<BluetoothNotificationsHookOptions> = ({ children, ...props }) => {
  const bluetoothState = useBluetoothNotifications(props);
  return <BluetoothContext.Provider value={bluetoothState}>{children}</BluetoothContext.Provider>;
};

export default BluetoothProvider;
