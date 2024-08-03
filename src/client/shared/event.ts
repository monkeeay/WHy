import { iswindow } from "..";
import { ScramjetClient } from "../client";
import { unproxy } from "./unproxy";

const realOnEvent = Symbol.for("scramjet original onevent function");

export default function (client: ScramjetClient, self: Self) {
	const handlers = {
		message: {
			_init() {
				if (typeof this.data === "object" && "$scramjet$type" in this.data) {
					// this is a ctl message
					return false;
				}

				return true;
			},
			origin() {
				if (typeof this.data === "object" && "$scramjet$origin" in this.data)
					return this.data.$scramjet$origin;

				// then it must be from a worker, which we aren't currently rewriting
				return client.url.origin;
			},
			data() {
				if (typeof this.data === "object" && "$scramjet$data" in this.data)
					return this.data.$scramjet$data;

				return this.data;
			},
		},
	};

	function wraplistener(listener: (...args: any) => any) {
		return new Proxy(listener, {
			apply(target, thisArg, argArray) {
				const realEvent: Event = argArray[0];

				// we only need to handle events dispatched from the browser
				if (realEvent.isTrusted) {
					const type = realEvent.type;

					if (type in handlers) {
						const handler = handlers[type];

						if (handler._init) {
							if (handler._init.call(realEvent) === false) return;
						}

						argArray[0] = new Proxy(realEvent, {
							get(_target, prop, reciever) {
								if (prop in handler) {
									return handler[prop].call(_target);
								}

								return Reflect.get(target, prop, reciever);
							},
						});
					}
				}

				return Reflect.apply(target, thisArg, argArray);
			},
		});
	}

	client.Proxy("EventTarget.prototype.addEventListener", {
		apply(ctx) {
			unproxy(ctx, client);
			if (typeof ctx.args[1] !== "function") return;

			const origlistener = ctx.args[1];
			const proxylistener = wraplistener(origlistener);

			ctx.args[1] = proxylistener;

			let arr = client.eventcallbacks.get(ctx.this);
			arr ||= [] as any;
			arr.push({
				event: ctx.args[0] as string,
				originalCallback: origlistener,
				proxiedCallback: proxylistener,
			});
			client.eventcallbacks.set(ctx.this, arr);
		},
	});

	client.Proxy("EventTarget.prototype.removeEventListener", {
		apply(ctx) {
			unproxy(ctx, client);
			if (typeof ctx.args[1] !== "function") return;

			const arr = client.eventcallbacks.get(ctx.this);
			if (!arr) return;

			const i = arr.findIndex(
				(e) => e.event === ctx.args[0] && e.originalCallback === ctx.args[1]
			);
			if (i === -1) return;

			arr.splice(i, 1);
			client.eventcallbacks.set(ctx.this, arr);

			ctx.args[1] = arr[i].proxiedCallback;
		},
	});

	client.Proxy("EventTarget.prototype.dispatchEvent", {
		apply(ctx) {
			unproxy(ctx, client);
		},
	});

	if (!iswindow) return;

	const targets = [self.window, self.HTMLElement.prototype];

	for (const target of targets) {
		const keys = Reflect.ownKeys(target);

		for (const key of keys) {
			if (
				typeof key === "string" &&
				key.startsWith("on") &&
				handlers[key.slice(2)]
			) {
				const descriptor = Object.getOwnPropertyDescriptor(target, key);
				if (!descriptor.get || !descriptor.set || !descriptor.configurable)
					continue;

				// these are the `onmessage`, `onclick`, etc. properties
				client.RawTrap(target, key, {
					get(ctx) {
						if (this[realOnEvent]) return this[realOnEvent];

						return ctx.get();
					},
					set(ctx, value: any) {
						this[realOnEvent] = value;

						if (typeof value !== "function") return ctx.set(value);

						ctx.set(wraplistener(value));
					},
				});
			}
		}
	}
}
