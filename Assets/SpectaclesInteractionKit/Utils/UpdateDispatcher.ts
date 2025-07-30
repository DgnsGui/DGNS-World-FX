export interface IUpdateDispatcher {
  createUpdateEvent(name: string): DispatchedUpdateEvent

  createLateUpdateEvent(name: string): DispatchedUpdateEvent

  setUpdateEventPriority(updateEvent: DispatchedUpdateEvent, priority: number): void

  removeUpdateEvent(event: DispatchedUpdateEvent): void

  removeLateUpdateEvent(event: DispatchedUpdateEvent): void

  createDelayedEvent(): DispatchedDelayedEvent

  removeDelayedEvent(event: DispatchedDelayedEvent): void
}

export class UpdateDispatcher implements IUpdateDispatcher {
  protected mainUpdateEvent: SceneEvent
  protected mainLateUpdateEvent: SceneEvent
  protected updateEvents: DispatchedUpdateEvent[] = []
  protected lateUpdateEvents: DispatchedUpdateEvent[] = []
  protected delayedEvents: DispatchedDelayedEvent[] = []

  constructor(script: ScriptComponent) {
    this.mainUpdateEvent = script.createEvent("UpdateEvent")
    this.mainUpdateEvent.bind(() => {
      this.onUpdate()
    })
    this.mainLateUpdateEvent = script.createEvent("LateUpdateEvent")
    this.mainLateUpdateEvent.bind(() => {
      this.onLateUpdate()
    })
    this.dispatchUpdateEvents = this.dispatchUpdateEventsNoDebug
  }

  createUpdateEvent(name: string): DispatchedUpdateEvent {
    const event = new DispatchedUpdateEvent(name)
    this.updateEvents.push(event)
    return event
  }

  createLateUpdateEvent(name: string): DispatchedUpdateEvent {
    const event = new DispatchedUpdateEvent(name)
    this.lateUpdateEvents.push(event)
    return event
  }

  setUpdateEventPriority(updateEvent: DispatchedUpdateEvent, priority: number) {
    for (let i = 0; i < this.updateEvents.length; i++) {
      if (this.updateEvents[i].id === updateEvent.id) {
        this.updateEvents.splice(i, 1)
        i--
      }
    }
    if (priority >= this.updateEvents.length) {
      this.updateEvents.push(updateEvent)
    } else {
      this.updateEvents.splice(priority, 0, updateEvent)
    }
  }

  removeUpdateEvent(event: DispatchedUpdateEvent): void {
    event.markedForRemoval = true
  }

  removeLateUpdateEvent(event: DispatchedUpdateEvent): void {
    event.markedForRemoval = true
  }

  /**
   * Creates a delayed event that will be called after a specified time. You must call `reset()` immediately after
   * creating the event to set the callback delay, otherwise it will fire on the next frame. Events should be removed
   * after use by calling `removeDelayedEvent()`.
   *
   * @returns The created delayed event.
   */
  createDelayedEvent(): DispatchedDelayedEvent {
    const event = new DispatchedDelayedEvent()
    this.delayedEvents.push(event)
    return event
  }

  removeDelayedEvent(event: DispatchedDelayedEvent): void {
    event.markedForRemoval = true
  }

  private onUpdate() {
    this.dispatchUpdateEvents(this.updateEvents, this.timesUpdate, "Update")
    this.dispatchDelayedEvents()
  }

  private onLateUpdate() {
    this.dispatchUpdateEvents(this.lateUpdateEvents, this.timesLateUpdate, "LateUpdate")
  }

  protected timesUpdate: {[name: string]: {updCnt: number; time: number}} = {}
  protected timesLateUpdate: {[name: string]: {updCnt: number; time: number}} = {}
  protected dispatchUpdateEvents: (
    pool: DispatchedUpdateEvent[],
    times: {[name: string]: {updCnt: number; time: number}},
    eventName: string
  ) => void
  protected dispatchedEvents = 0

  protected dispatchUpdateEventsNoDebug = (pool: DispatchedUpdateEvent[]) => {
    for (let i = 0; i < pool.length; i++) {
      if (pool[i].markedForRemoval) {
        pool.splice(i, 1)
        i--
        continue
      }

      if (pool[i].enabled) {
        pool[i].eventHappened()
      }
    }
  }

  private dispatchDelayedEvents() {
    const curTime = getTime()
    for (let i = 0; i < this.delayedEvents.length; i++) {
      if (this.delayedEvents[i].markedForRemoval) {
        this.delayedEvents.splice(i, 1)
        i--
        continue
      }

      if (this.delayedEvents[i].enabled && !this.delayedEvents[i].getWasCalled()) {
        if (this.delayedEvents[i].callAfter < curTime) {
          this.delayedEvents[i].eventHappened()
        }
      }
    }
  }
}

export class BaseDispatchedEvent {
  enabled: boolean
  id: number
  markedForRemoval: boolean = false
  static TIMES_CREATED = 0
  constructor() {
    this.enabled = true
    this.id = BaseDispatchedEvent.TIMES_CREATED++
  }
}

export class DispatchedUpdateEvent extends BaseDispatchedEvent {
  override enabled: boolean = true

  constructor(public readonly name: string) {
    super()
    this.enabled = true
  }
  // eslint-disable-next-line
  bind(callback: Function) {
    this.callback = callback
  }

  eventHappened() {
    if (this.callback) {
      this.callback()
    }
  }

  // eslint-disable-next-line
  private callback: Function | undefined
}

export class DispatchedDelayedEvent extends BaseDispatchedEvent {
  override enabled: boolean = true
  constructor() {
    super()
    this.wasCalled = false
  }
  reset(time: number): void {
    this.wasCalled = false
    this.callAfter = getTime() + time
  }

  // eslint-disable-next-line
  bind(callback: Function) {
    this.callback = callback
  }

  eventHappened(): void {
    this.wasCalled = true
    if (this.callback) {
      this.callback()
    }
  }

  getWasCalled(): boolean {
    return this.wasCalled
  }

  callAfter: number = 0

  // eslint-disable-next-line
  private callback: Function | undefined
  private wasCalled: boolean
}
