export interface BluetoothNotificationsPayload {
  status: BluetoothNotificationsStatus;
  setListener: (listener: (data: BluetoothRemoteGATTCharacteristic) => void) => void;
  startNotifications: () => void;
  stopNotifications: () => void;
}

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

export interface BluetoothDeviceRequestCancel {
  type: "cancel";
}

export interface BluetoothDeviceRequestSuccess {
  type: "success";
  device: BluetoothDevice;
}

export interface BluetoothGattConnectSuccess {
  type: "success";
  server: BluetoothRemoteGATTServer;
}

export interface BluetoothServiceRequestSuccess {
  type: "success";
  service: BluetoothRemoteGATTService;
}

export interface BluetoothCharacteristicRequestSuccess {
  type: "success";
  characteristic: BluetoothRemoteGATTCharacteristic;
}

export interface BluetoothStartStreamSuccess {
  type: "success";
  // stream: string;
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  service: BluetoothRemoteGATTService;
  characteristic: BluetoothRemoteGATTCharacteristic;
}

export enum BluetoothDeviceRequestStatus {
  CANCEL = "cancel",
  ERROR = "error",
  SUCCESS = "success",
  REQUESTING = "requesting",
  READY = "ready",
}

export interface BluetoothNotificationsHookOptions {
  characteristicUuid: string;
  serviceUuid: string;
  deviceOptions?: RequestDeviceOptions;
  parser?: (data: DataView, offset?: number) => number | string;
  onNotification?: (parsed: number | string, event: Event) => void;
  onError?: (error: Error) => void;
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

export const HEALTH_THERMOMETER_UUID = "health_thermometer";
export const TEMPERATURE_MEASUREMENT_UUID = "temperature_measurement";
export const USER_CANCEL_ERROR_CODE = 8;
