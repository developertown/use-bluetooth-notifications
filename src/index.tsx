import {
  BluetoothNotificationsHookOptions,
  BluetoothConnections,
  TEMPERATURE_MEASUREMENT_UUID,
  HEALTH_THERMOMETER_UUID,
  BluetoothNotificationsStatus,
} from "./types/Bluetooth";
import { useCallback, useState, useEffect } from "react";
import { getFloatValue } from "./utils/getFloatValue";

function parse(val: DataView) {
  const a = [];

  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < val.byteLength; i++) {
    a.push("0x" + ("00" + val.getUint8(i).toString(16)).slice(-2));
  }

  // console.log("> " + a.join(" "));
  return a.join(" ");
}

export const defaultHookOptions = {
  serviceUuid: HEALTH_THERMOMETER_UUID,
  characteristicUuid: TEMPERATURE_MEASUREMENT_UUID,
};

export function useBluetoothNotifications({
  serviceUuid = HEALTH_THERMOMETER_UUID,
  characteristicUuid = TEMPERATURE_MEASUREMENT_UUID,
  deviceOptions = { filters: [{ services: [serviceUuid] }] },
  notificationHandler,
  parser = parse,
}: // parser = getFloatValue,
BluetoothNotificationsHookOptions = defaultHookOptions): BluetoothConnections {
  const [device, setDevice] = useState<BluetoothDevice>();
  const [server, setServer] = useState<BluetoothRemoteGATTServer>();
  const [service, setService] = useState<BluetoothRemoteGATTService>();
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
  const [stream, setStream] = useState<string>();
  const [status, setStatus] = useState<BluetoothNotificationsStatus>(BluetoothNotificationsStatus.READY);

  function getBluetooth(): Bluetooth {
    if (!navigator.bluetooth) {
      throw new Error("This device is not capable of using bluetooth");
    }
    return navigator.bluetooth;
  }

  const handleNotifications = useCallback(
    (event: Event) => {
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
      if (value) {
        const parsed = parser(value, value.byteOffset);
        console.log("parsed", parsed);
        setStream(`${parsed}`);
        if (notificationHandler) {
          notificationHandler(`${parsed}`, event);
        }
      }
    },
    [notificationHandler, parser],
  );

  const reset = useCallback(() => {
    if (characteristic) {
      characteristic.removeEventListener("characteristicvaluechanged", handleNotifications);
    }

    // setStream(undefined);
    setCharacteristic(undefined);
    setService(undefined);

    if (server) {
      server.disconnect();
      setServer(undefined);
    }

    setDevice(undefined);
    setStatus(BluetoothNotificationsStatus.STOPPED);
  }, [characteristic, handleNotifications, server]);

  const startStream = useCallback(async () => {
    const bluetooth = getBluetooth();
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
      if (error.code === 8) {
        setStatus(BluetoothNotificationsStatus.CANCELLED);
        return;
      }
      console.error("Error starting notifications:", error);
      setStatus(BluetoothNotificationsStatus.ERROR);
    }
  }, [characteristicUuid, deviceOptions, serviceUuid]);

  const stopStream = useCallback(async () => {
    try {
      if (characteristic && device && device.gatt) {
        setStatus(BluetoothNotificationsStatus.STOPPING);
        await characteristic.stopNotifications();
        reset();
      }
    } catch (error) {
      console.error("Error stopping notifications:", error);
      throw error;
    }
  }, [characteristic, device, reset]);

  useEffect(() => {
    if (characteristic) {
      characteristic.addEventListener("characteristicvaluechanged", handleNotifications);
    }

    return () => {
      if (characteristic) {
        characteristic.removeEventListener("characteristicvaluechanged", handleNotifications);
      }
    };
  }, [characteristic, handleNotifications]);

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
    stream,
    status,
    startStream,
    stopStream,
  };
}

export default useBluetoothNotifications;
