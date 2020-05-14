import * as React from "react";
import { useCallback, PropsWithChildren, FC } from "react";
import cn from "classnames";
import {
  TEMPERATURE_MEASUREMENT_UUID,
  HEALTH_THERMOMETER_UUID,
  BluetoothNotificationsStatus,
} from "../src/types/Bluetooth";
import useBluetoothNotifications from "../src";

// const { useCallback } = React;

type TypographyColor =
  | "inherit"
  | "initial"
  | "primary"
  | "secondary"
  | "textPrimary"
  | "textSecondary"
  | "error"
  | undefined;

type Props = {
  serviceUuid?: string;
  characteristicUuid?: string;
};

const Grid: FC<PropsWithChildren<{}>> = ({ children }) => (
  <div style={{ padding: "1rem" }}>
    <div style={{ display: "grid", gridTemplateColumns: "100%", gridGap: "1rem" }}>{children}</div>
  </div>
);

export const BluetoothDisplay: FC<Props> = ({
  serviceUuid = HEALTH_THERMOMETER_UUID,
  characteristicUuid = TEMPERATURE_MEASUREMENT_UUID,
}) => {
  const notificationHandler = useCallback((parsed: string, event: Event) => {
    console.log("Hook notification handler", { parsed, event });
  }, []);

  const { device, status, stream, startStream, stopStream } = useBluetoothNotifications({
    serviceUuid,
    characteristicUuid,
    notificationHandler,
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

      <button
        onClick={async (event) => {
          console.log("Starting notifications...");
          try {
            await startStream();
          } catch (error) {
            console.error("Error starting stream:", error);
          }
        }}
      >
        Start Notifications
      </button>

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
    </Grid>
  );
};

export default BluetoothDisplay;
