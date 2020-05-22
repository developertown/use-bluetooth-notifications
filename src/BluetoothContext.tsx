import * as React from "react";
import { BluetoothConnections, BluetoothNotificationsStatus } from "./types/Bluetooth";

export const BluetoothContext = React.createContext<BluetoothConnections>({
  status: BluetoothNotificationsStatus.READY,
  startStream: () => {
    return;
  },
  stopStream: () => {
    return;
  },
});

export default BluetoothContext;
