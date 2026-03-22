export class Observable<T> {
  private _value: T;
  private listeners: ((val: T) => void)[] = [];

  constructor(val: T) {
    this._value = val;
  }

  get value() {
    return this._value;
  }

  set value(val: T) {
    this._value = val;
    this.notify();
  }

  subscribe(listener: (val: T) => void, fireImmediately = false) {
    this.listeners.push(listener);
    if (fireImmediately) listener(this._value);
  }

  private notify() {
    this.listeners.forEach((l) => l(this._value));
  }
}
