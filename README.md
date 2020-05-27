# use-bluetooth-notifications
A react hook to easily use and listen to bluetooth notifications from a specified service and characteristic

## Usage
There are two options for connecting. You can use the `useBluetoothNotifications` hook directly or use `BluetoothContext` and the `useBluetooth` hook:

### useBluetoothNotifications
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

return (
  <div>
    <button onClick={startStream}>Start</button>
    <button onClick={stopStream}>Stop</button>
  </div>
);
```

### useBluetooth & useBluetoothProvider
```tsx
const MyComponent: React.FC<{}> = () => {
  const { device, server, service, characteristic, status, startStream, stopStream } = useBluetooth();
  return (
    <div>
      <button onClick={startStream}>Start</button>
      <button onClick={stopStream}>Stop</button>
    </div>
  );
};

const App: React.FC<{}> = () => {
  const onNotification = useCallback((parsedValue: string | number, event: Event): void => { ... }, []);
  const onError = useCallback((error: Error): void => { ... }, []);
  const parser = useCallback((value: DataView, offset?: number): number | string => { ... }, []);

  return (
    <BluetoothProvider
      serviceUuid="health_thermometer"
      characteristicUuid="temperature_measurement"
      parser={myParser}
      onNotification={onNotification}
      onError={onError}
    >
      <MyComponent />
    </BluetoothProvider>
  );
};
```
