import * as React from "react";
import { BluetoothConnections } from "./types/Bluetooth";

export const BluetoothContext = React.createContext<BluetoothConnections | undefined>(undefined);

export default BluetoothContext;
