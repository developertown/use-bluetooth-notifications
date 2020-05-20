import { WebBluetoothMock } from "web-bluetooth-mock";

export enum BluetoothNotificationsStatus {
  READY = "ready",
  STOPPED = "stopped",
  STARTED = "started",
  STARTING = "starting",
  STOPPING = "stopping",
  ERROR = "error",
  CANCELLED = "cancelled",
}

export enum BluetoothEvent {
  onAdvertisementReceived = "advertisementreceived",
  onAvailabilityChanged = "availabilitychanged",
  onGATTServerDisconnected = "gattserverdisconnected",
  onCharacteristicValueChanged = "characteristicvaluechanged",
  onServiceAdded = "serviceadded",
  onServiceChanged = "servicechanged",
  onServiceRemoved = "serviceremoved",
}

export type BluetoothMock = Bluetooth & WebBluetoothMock;

export interface BluetoothNotificationsHookOptions {
  characteristicUuid: string;
  serviceUuid: string;
  deviceOptions?: RequestDeviceOptions;
  parser?: (data: DataView, offset?: number) => number | string;
  onNotification?: (parsed: number | string, event: Event) => void;
  onError?: (error: Error) => void;
  onServerDisconnect?: (event: Event) => void;
}

export interface BluetoothConnections {
  device?: BluetoothDevice;
  server?: BluetoothRemoteGATTServer;
  service?: BluetoothRemoteGATTService;
  characteristic?: BluetoothRemoteGATTCharacteristic;
  stream?: string;
  status: BluetoothNotificationsStatus;
  startStream: () => void;
  stopStream: () => void;
}

export const USER_CANCEL_ERROR_CODE = 8;
