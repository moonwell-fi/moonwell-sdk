import { uniqueId } from "lodash";

const messages: Record<
  string,
  {
    id: string;
    start: Date;
    end?: Date;
    duration?: number;
    action: string;
    message: string;
  }
> = {};

export function start(action: string, message: string) {
  if (window) {
    const id = uniqueId();

    messages[id] = {
      id,
      start: new Date(),
      action,
      message,
    };

    window.dispatchEvent(
      new CustomEvent("moonwell-sdk", {
        detail: messages[id],
      }),
    );

    return id;
  }
  return undefined;
}

export function end(id?: string) {
  if (window && id) {
    const message = messages[id];
    if (message) {
      message.end = new Date();
      message.duration = message.end.getTime() - message.start.getTime();
      window.dispatchEvent(
        new CustomEvent("moonwell-sdk", {
          detail: message,
        }),
      );
    }
  }
  return undefined;
}
