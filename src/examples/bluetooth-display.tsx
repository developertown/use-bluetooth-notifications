import * as React from "react";
import cn from "classnames";
import { BluetoothNotificationsStatus } from "../types/Bluetooth";
import useBluetoothNotifications from "..";

type Props = {
  serviceUuid?: string;
  characteristicUuid?: string;
};

const Grid: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div style={{ padding: "1rem" }}>
    <div style={{ display: "grid", gridTemplateColumns: "100%", gridGap: "1rem" }}>{children}</div>
  </div>
);

export const BluetoothDisplay: React.FC<Props> = ({
  serviceUuid = "health_thermometer",
  characteristicUuid = "temperature_measurement",
}) => {
  const [stream, setStream] = React.useState<number | string | null>(null);

  const parser = React.useCallback((val: DataView, offset = 0) => {
    const noFirstByte = val.buffer.slice(1);
    console.log("value", val, noFirstByte, new Uint32Array(noFirstByte));
    const a: string[] = [];

    // Convert raw data bytes to hex values just for the sake of showing something.
    // In the "real" world, you'd use data.getUint8, data.getUint16 or even
    // TextDecoder to process raw data bytes.
    a.push("0x");
    for (let i = 0; i < val.byteLength; i++) {
      a.push(("00" + val.getUint8(i).toString(16)).slice(-2));
    }

    console.log("parsed as string", parseInt(a.join("")));
    return a.join(" ");
  }, []);

  const onNotification = React.useCallback((parsed: number | string, event: Event) => {
    console.log("Hook notification handler", { parsed, event });
    setStream(parsed);
  }, []);

  const onError = React.useCallback((error: Error) => {
    console.error("Bluetooth Error:", error);
  }, []);

  const { device, status, startStream, stopStream } = useBluetoothNotifications({
    serviceUuid,
    characteristicUuid,
    deviceOptions: {
      filters: [{ services: [serviceUuid] }],
    },
    onNotification,
    onError,
    // parser,
  });

  const color = cn({
    blue: status === BluetoothNotificationsStatus.READY,
    green: status === BluetoothNotificationsStatus.STARTED,
    orange: status === BluetoothNotificationsStatus.STARTING || status === BluetoothNotificationsStatus.STOPPING,
    black: status === BluetoothNotificationsStatus.CANCELLED || status === BluetoothNotificationsStatus.STOPPED,
    red: status === BluetoothNotificationsStatus.ERROR,
  });

  return (
    <Grid>
      <h1>Bluetooth Devices</h1>

      <dl>
        <dt>Device Name:</dt>
        <dd>
          <pre>{device?.name}</pre>
        </dd>
        <dt>Device Notification Status:</dt>
        <dd>
          <p
            style={{
              color,
            }}
          >
            {status}
          </p>
        </dd>

        <dt>Notifications:</dt>
        <dd>
          <pre>{stream}</pre>
        </dd>
      </dl>

      <div>
        <button
          onClick={async (event) => {
            console.log("Starting notifications...");
            try {
              setStream(null);
              await startStream();
            } catch (error) {
              console.error("Error starting stream:", error);
            }
          }}
        >
          Start Notifications
        </button>
      </div>

      <div>
        <button
          onClick={async (event) => {
            console.log("stopping notifications...");
            try {
              await stopStream();
            } catch (error) {
              console.error("Error starting stream:", error);
            }
          }}
        >
          Stop Notifications
        </button>
      </div>
    </Grid>
  );
};

export default BluetoothDisplay;
