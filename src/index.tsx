import {
  BluetoothNotificationsHookOptions,
  BluetoothConnections,
  BluetoothNotificationsStatus,
  BluetoothEvent,
  USER_CANCEL_ERROR_CODE,
} from "./types/Bluetooth";
import { useCallback, useState, useEffect, useMemo } from "react";
import { getFloatValue } from "./utils/getFloatValue";

export const defaultHookOptions = {
  serviceUuid: "",
  characteristicUuid: "",
  deviceOptions: { acceptAllDevices: true, optionalServices: [] },
  parser: getFloatValue,
  onNotification: (parsed: number | string, event: Event) => {
    return;
  },
  onServerDisconnect: (event: Event) => {
    return;
  },
};

export function useBluetoothNotifications(
  _options: BluetoothNotificationsHookOptions = defaultHookOptions,
): BluetoothConnections {
  const [device, setDevice] = useState<BluetoothDevice>();
  const [server, setServer] = useState<BluetoothRemoteGATTServer>();
  const [service, setService] = useState<BluetoothRemoteGATTService>();
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
  const [status, setStatus] = useState<BluetoothNotificationsStatus>(BluetoothNotificationsStatus.READY);

  const {
    serviceUuid,
    characteristicUuid,
    deviceOptions,
    onNotification,
    onServerDisconnect,
    onError,
    parser,
  } = useMemo(() => {
    return { ...defaultHookOptions, ..._options };
  }, [_options]);

  const bluetooth: Bluetooth = useMemo(() => {
    if (!navigator.bluetooth) {
      const error = new Error("This device is not capable of using bluetooth");
      if (onError) {
        onError(error);
      } else {
        throw error;
      }
    }
    return navigator.bluetooth;
  }, [onError]);

  const handleNotifications = useCallback(
    (event: Event) => {
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (value) {
        const parsed = parser(value);
        if (onNotification) {
          onNotification(parsed, event);
        }
      }
    },
    [onNotification, parser],
  );

  const handleError = useCallback(
    (error: Error) => {
      setStatus(BluetoothNotificationsStatus.ERROR);
      if (onError) {
        onError(error);
      } else {
        throw error;
      }
    },
    [onError],
  );

  const reset = useCallback(() => {
    setCharacteristic(undefined);
    setService(undefined);

    if (server) {
      server.disconnect();
      setServer(undefined);
    }

    setDevice(undefined);
    setStatus(BluetoothNotificationsStatus.STOPPED);
  }, [server]);

  const startStream = useCallback(async () => {
    try {
      setStatus(BluetoothNotificationsStatus.STARTING);
      let service: BluetoothRemoteGATTService;
      let characteristic: BluetoothRemoteGATTCharacteristic;

      const device = await bluetooth.requestDevice(deviceOptions);
      setDevice(device);

      const server = await device.gatt?.connect();

      if (server) {
        setServer(server);
        service = await server.getPrimaryService(serviceUuid);
        characteristic = await service.getCharacteristic(characteristicUuid);
        setService(service);
        setCharacteristic(characteristic);

        await characteristic.startNotifications();
        setStatus(BluetoothNotificationsStatus.STARTED);
      } else {
        setStatus(BluetoothNotificationsStatus.ERROR);
        throw new Error("No GATT server found");
      }
    } catch (error) {
      if (error.code === USER_CANCEL_ERROR_CODE) {
        setStatus(BluetoothNotificationsStatus.CANCELLED);
        return;
      }
      handleError(error);
    }
  }, [bluetooth, characteristicUuid, deviceOptions, handleError, serviceUuid]);

  const stopStream = useCallback(async () => {
    try {
      if (characteristic && device && device.gatt) {
        setStatus(BluetoothNotificationsStatus.STOPPING);
        await characteristic.stopNotifications();
        reset();
      }
    } catch (error) {
      handleError(error);
    }
  }, [characteristic, device, handleError, reset]);

  const _onServerDisconnect = useCallback(
    (event: Event) => {
      if (onServerDisconnect) {
        onServerDisconnect(event);
      }
    },
    [onServerDisconnect],
  );

  useEffect(() => {
    if (device) {
      device.addEventListener(BluetoothEvent.onGATTServerDisconnected, _onServerDisconnect);
    }

    if (characteristic) {
      characteristic.addEventListener(BluetoothEvent.onCharacteristicValueChanged, handleNotifications);
    }

    return () => {
      if (device) {
        device.removeEventListener(BluetoothEvent.onGATTServerDisconnected, _onServerDisconnect);
      }

      if (characteristic) {
        characteristic.removeEventListener(BluetoothEvent.onCharacteristicValueChanged, handleNotifications);
      }
    };
  }, [_onServerDisconnect, characteristic, device, handleNotifications]);

  useEffect(() => {
    return () => {
      if (server) {
        server.disconnect();
      }
    };
  }, [server]);

  return {
    device,
    server,
    service,
    characteristic,
    status,
    startStream,
    stopStream,
  };
}

export default useBluetoothNotifications;
