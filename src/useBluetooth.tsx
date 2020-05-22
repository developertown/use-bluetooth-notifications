import * as React from "react";
import { BluetoothConnections } from "./types/Bluetooth";
import { BluetoothContext } from "./BluetoothContext";

export function useBluetooth() {
  const context = React.useContext<BluetoothConnections | undefined>(BluetoothContext);
  if (context === undefined) {
    throw new Error("useBluetooth must be used within a BluetoothProvider");
  }
  return context;
}

export default useBluetooth;
