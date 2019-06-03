import { find, forEach } from '@fin/arrays';

export type Slot<T, U> = (sender: T, args: U) => void;

export interface ISignal<T, U> {
  connect(slot: Slot<T, U>, thisArg?: any): boolean;
  disconnect(slot: Slot<T, U>, thisArg?: any): boolean;
}

export class Signal<T, U> implements ISignal<T, U> {
  constructor(sender: T) {
    this.sender = sender;
  }

  readonly sender: T;

  connect(slot: Slot<T, U>, thisArg?: any): boolean {
    return Private.connect(this, slot, thisArg);
  }

  disconnect(slot: Slot<T, U>, thisArg?: any): boolean {
    return Private.disconnect(this, slot, thisArg);
  }

  emit(args: U): void {
    Private.emit(this, args);
  }
}

export namespace Signal {
  export function disconnectBetween(sender: any, receiver: any): void {
    Private.disconnectBetween(sender, receiver);
  }

  export function disconnectSender(sender: any): void {
    Private.disconnectSender(sender);
  }

  export function disconnectReceiver(receiver: any): void {
    Private.disconnectReceiver(receiver);
  }

  export function disconnectAll(object: any): void {
    Private.disconnectAll(object);
  }

  export function clearData(object: any): void {
    Private.disconnectAll(object);
  }

  export type ExceptionHandler = (err: Error) => void;

  export function getExceptionHandler(): ExceptionHandler {
    return Private.exceptionHandler;
  }

  export function setExceptionHandler(handler: ExceptionHandler): ExceptionHandler {
    let old = Private.exceptionHandler;
    Private.exceptionHandler = handler;
    return old;
  }
}

namespace Private {
  export let exceptionHandler: Signal.ExceptionHandler = (err: Error) => {
    console.error(err);
  };

  export function connect<T, U>(signal: Signal<T, U>, slot: Slot<T, U>, thisArg?: any): boolean {
    // Coerce a `null` `thisArg` to `undefined`.
    thisArg = thisArg || undefined;

    // Ensure the sender's array of receivers is created.
    let receivers = receiversForSender.get(signal.sender);
    if (!receivers) {
      receivers = [];
      receiversForSender.set(signal.sender, receivers);
    }

    // Bail if a matching connection already exists.
    if (findConnection(receivers, signal, slot, thisArg)) {
      return false;
    }

    // Choose the best object for the receiver.
    let receiver = thisArg || slot;

    // Ensure the receiver's array of senders is created.
    let senders = sendersForReceiver.get(receiver);
    if (!senders) {
      senders = [];
      sendersForReceiver.set(receiver, senders);
    }

    // Create a new connection and add it to the end of each array.
    let connection = { signal, slot, thisArg };
    receivers.push(connection);
    senders.push(connection);

    // Indicate a successful connection.
    return true;
  }

  /**
   * Disconnect a slot from a signal.
   *
   * @param signal - The signal of interest.
   *
   * @param slot - The slot to disconnect from the signal.
   *
   * @param thisArg - The `this` context for the slot. If provided,
   *   this must be a non-primitive object.
   *
   * @returns `true` if the connection is removed, `false` otherwise.
   */
  export function disconnect<T, U>(signal: Signal<T, U>, slot: Slot<T, U>, thisArg?: any): boolean {
    // Coerce a `null` `thisArg` to `undefined`.
    thisArg = thisArg || undefined;

    // Lookup the list of receivers, and bail if none exist.
    let receivers = receiversForSender.get(signal.sender);
    if (!receivers || receivers.length === 0) {
      return false;
    }

    // Bail if no matching connection exits.
    let connection = findConnection(receivers, signal, slot, thisArg);
    if (!connection) {
      return false;
    }

    // Choose the best object for the receiver.
    let receiver = thisArg || slot;

    // Lookup the array of senders, which is now known to exist.
    let senders = sendersForReceiver.get(receiver)!;

    // Clear the connection and schedule cleanup of the arrays.
    connection.signal = null;
    doCleanup(receivers);
    doCleanup(senders);

    // Indicate a successful disconnection.
    return true;
  }

  /**
   * Remove all connections between a sender and receiver.
   *
   * @param sender - The sender object of interest.
   *
   * @param receiver - The receiver object of interest.
   */
  export function disconnectBetween(sender: any, receiver: any): void {
    // If there are no receivers, there is nothing to do.
    let receivers = receiversForSender.get(sender);
    if (!receivers || receivers.length === 0) {
      return;
    }

    // If there are no senders, there is nothing to do.
    let senders = sendersForReceiver.get(receiver);
    if (!senders || senders.length === 0) {
      return;
    }

    // Clear each connection between the sender and receiver.
    forEach(senders, connection => {
      // Skip connections which have already been cleared.
      if (!connection.signal) {
        return;
      }

      // Clear the connection if it matches the sender.
      if (connection.signal.sender === sender) {
        connection.signal = null;
      }
    });

    // Schedule a cleanup of the senders and receivers.
    doCleanup(receivers);
    doCleanup(senders);
  }

  /**
   * Remove all connections where the given object is the sender.
   *
   * @param sender - The sender object of interest.
   */
  export function disconnectSender(sender: any): void {
    // If there are no receivers, there is nothing to do.
    let receivers = receiversForSender.get(sender);
    if (!receivers || receivers.length === 0) {
      return;
    }

    // Clear each receiver connection.
    forEach(receivers, connection => {
      // Skip connections which have already been cleared.
      if (!connection.signal) {
        return;
      }

      // Choose the best object for the receiver.
      let receiver = connection.thisArg || connection.slot;

      // Clear the connection.
      connection.signal = null;

      // Cleanup the array of senders, which is now known to exist.
      doCleanup(sendersForReceiver.get(receiver)!);
    });

    // Schedule a cleanup of the receivers.
    doCleanup(receivers);
  }

  /**
   * Remove all connections where the given object is the receiver.
   *
   * @param receiver - The receiver object of interest.
   */
  export function disconnectReceiver(receiver: any): void {
    // If there are no senders, there is nothing to do.
    let senders = sendersForReceiver.get(receiver);
    if (!senders || senders.length === 0) {
      return;
    }

    // Clear each sender connection.
    forEach(senders, connection => {
      // Skip connections which have already been cleared.
      if (!connection.signal) {
        return;
      }

      // Lookup the sender for the connection.
      let sender = connection.signal.sender;

      // Clear the connection.
      connection.signal = null;

      // Cleanup the array of receivers, which is now known to exist.
      doCleanup(receiversForSender.get(sender)!);
    });

    // Schedule a cleanup of the list of senders.
    doCleanup(senders);
  }

  /**
   * Remove all connections where an object is the sender or receiver.
   *
   * @param object - The object of interest.
   */
  export function disconnectAll(object: any): void {
    // Clear and cleanup any receiver connections.
    let receivers = receiversForSender.get(object);
    if (receivers && receivers.length > 0) {
      forEach(receivers, connection => { connection.signal = null; });
      doCleanup(receivers);
    }

    // Clear and cleanup any sender connections.
    let senders = sendersForReceiver.get(object);
    if (senders && senders.length > 0) {
      forEach(senders, connection => { connection.signal = null; });
      doCleanup(senders);
    }
  }

  export function emit<T, U>(signal: Signal<T, U>, args: U): void {
    // If there are no receivers, there is nothing to do.
    let receivers = receiversForSender.get(signal.sender);
    if (!receivers || receivers.length === 0) {
      return;
    }

    // Invoke the slots for connections with a matching signal.
    // Any connections added during emission are not invoked.
    for (let i = 0, n = receivers.length; i < n; ++i) {
      let connection = receivers[i];
      if (connection.signal === signal) {
        invokeSlot(connection, args);
      }
    }
  }

  interface IConnection {
    /**
     * The signal for the connection.
     *
     * A `null` signal indicates a cleared connection.
     */
    signal: Signal<any, any> | null;

    /**
     * The slot connected to the signal.
     */
    readonly slot: Slot<any, any>;

    /**
     * The `this` context for the slot.
     */
    readonly thisArg: any;
  }

  const receiversForSender = new WeakMap<any, IConnection[]>();

  const sendersForReceiver = new WeakMap<any, IConnection[]>();

  function findConnection(connections: IConnection[], signal: Signal<any, any>, slot: Slot<any, any>, thisArg: any): IConnection | undefined {
    return find(connections, connection => (
      connection.signal === signal &&
      connection.slot === slot &&
      connection.thisArg === thisArg
    ));
  }

  function invokeSlot(connection: IConnection, args: any): void {
    let { signal, slot, thisArg } = connection;
    try {
      slot.call(thisArg, signal!.sender, args);
    } catch (err) {
      exceptionHandler(err);
    }
  }

  function doCleanup(array: IConnection[]): void {
    // isDeadConnection: connection.signal === null
    array = array.filter(connection => !!connection.signal);
  }
}
