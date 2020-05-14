# use-bluetooth-notifications
A react hook to easily use and listen to bluetooth notifications from a specified service and characteristic

## Usage

```tsx
const { device, status, stream, startStream, stopStream } = useBluetoothNotifications({
  serviceUuid = "health_thermometer",
  characteristicUuid = "temperature_measurement",
  notificationHandler = (parsedValue) => { ... },
});

<button onClick={startStream}>Start</button>
<button onClick={stopStream}>Stop</button>
```
