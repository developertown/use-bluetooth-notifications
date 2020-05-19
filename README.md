# use-bluetooth-notifications
A react hook to easily use and listen to bluetooth notifications from a specified service and characteristic

## Usage

```tsx
const [stream, setStream] = useState(); // Track stream state here in onNotification
const { device, status, startStream, stopStream } = useBluetoothNotifications({
  serviceUuid = "health_thermometer",
  characteristicUuid = "temperature_measurement",
  onNotification = (parsedValue: string | number, event: Event): void => {
    setStream(parsedValue);
  },
  onError = (error: Error): void => { ... },
  parser = (value: DataView, offset?: number): number | string => { ... }
});

<button onClick={startStream}>Start</button>
<button onClick={stopStream}>Stop</button>
```
