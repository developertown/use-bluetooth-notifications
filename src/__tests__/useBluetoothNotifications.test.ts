import {
  BluetoothNotificationsHookOptions,
  BluetoothNotificationsStatus,
  HEALTH_THERMOMETER_UUID,
  TEMPERATURE_MEASUREMENT_UUID,
  BluetoothEvent,
} from "../types/Bluetooth";
import { renderHook, act } from "@testing-library/react-hooks";
import { useBluetoothNotifications } from "..";
import { WebBluetoothMock, GattMock, CharacteristicMock, DeviceMock, PrimaryServiceMock } from "web-bluetooth-mock";

// export declare class WebBluetoothMock {
//   devices?: DeviceMock[];
//   constructor(devices: DeviceMock[]);
//   requestDevice(options: RequestDeviceOptions): Promise<DeviceMock>;
// }

// interface BTMock extends WebBluetoothMock {
//   devices?: DeviceMock[];
// }
// type BluetoothMock = BTMock & Bluetooth;
type BluetoothMock = Bluetooth & WebBluetoothMock;

const DEVICE_NAME = "MyThermometer";

describe("useBluetoothNotifications", () => {
  let device: DeviceMock;
  let parser: jest.Mock<number | string, [DataView, Event]>;
  let onNotification: jest.Mock<number | string, [DataView, Event]>;
  let onError: jest.Mock<number | string, [DataView, Event]>;

  beforeEach(() => {
    // Setup a Mock device and register the Web Bluetooth Mock
    device = new DeviceMock(DEVICE_NAME, [HEALTH_THERMOMETER_UUID]);
    navigator.bluetooth = new WebBluetoothMock([device]) as BluetoothMock;

    parser = jest.fn();
    onNotification = jest.fn();
    onError = jest.fn();
    jest.spyOn(device.gatt, "connect");
  });

  test("should use bluetooth notifications", async () => {
    const { result } = renderHook(() => useBluetoothNotifications());

    expect(result.current.startStream).toBeDefined();
    expect(result.current.stopStream).toBeDefined();

    await act(async () => {
      await result.current.startStream();
    });

    expect(result.current.status).toBe(BluetoothNotificationsStatus.STARTED);
    expect(result.current.device).toBeInstanceOf(DeviceMock);
    expect(result.current.server).toBeInstanceOf(GattMock);
    expect(result.current.service).toBeInstanceOf(PrimaryServiceMock);
    expect(result.current.characteristic).toBeInstanceOf(CharacteristicMock);
  });

  test("should be able to use custom parser", async () => {
    const parser = jest.fn();
    const { result } = renderHook(() =>
      useBluetoothNotifications({
        serviceUuid: HEALTH_THERMOMETER_UUID,
        characteristicUuid: TEMPERATURE_MEASUREMENT_UUID,
        parser,
      } as BluetoothNotificationsHookOptions),
    );

    await act(async () => {
      await result.current.startStream();
      result.current.characteristic?.dispatchEvent(new Event(BluetoothEvent.onCharacteristicValueChanged));
    });
    expect(parser).toHaveBeenCalled();
  });

  test("should be able to use custom notification handler", async () => {
    const onNotification = jest.fn();
    const onError = jest.fn();
    const parser = jest.fn();

    const { result } = renderHook(() =>
      useBluetoothNotifications({
        serviceUuid: HEALTH_THERMOMETER_UUID,
        characteristicUuid: TEMPERATURE_MEASUREMENT_UUID,
        onNotification,
        onError,
        parser,
      } as BluetoothNotificationsHookOptions),
    );

    await act(async () => {
      await result.current.startStream();
      result.current.characteristic?.dispatchEvent(new Event(BluetoothEvent.onCharacteristicValueChanged));
    });
    expect(parser).toHaveBeenCalled();
    expect(onNotification).toHaveBeenCalled();
  });

  test("should disconnect from server on unmount", async () => {
    const { result, unmount } = renderHook(() => useBluetoothNotifications());
    if (result.current.server) {
      result.current.server.disconnect = jest.fn();
      unmount();
      expect(result.current.server.disconnect).toHaveBeenCalled();
    }
  });

  test("stopStream should clean up the device connections", async () => {
    const { result } = renderHook(() => useBluetoothNotifications());
    await act(async () => {
      await result.current.startStream();
    });

    expect(result.current.status).toBe(BluetoothNotificationsStatus.STARTED);
    expect(result.current.device).toBeDefined();
    expect(result.current.server).toBeDefined();
    expect(result.current.service).toBeDefined();
    expect(result.current.characteristic).toBeDefined();

    await act(async () => {
      await result.current.stopStream();
    });

    expect(result.current.status).toBe(BluetoothNotificationsStatus.STOPPED);
    expect(result.current.device).toBe(undefined);
    expect(result.current.server).toBe(undefined);
    expect(result.current.service).toBe(undefined);
    expect(result.current.characteristic).toBe(undefined);
  });
});
