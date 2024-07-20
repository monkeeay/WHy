import { client } from ".";

const handler: ProxyHandler<Storage> = {
	get(target, prop) {
		switch (prop) {
			case "getItem":
				return (key: string) => {
					return target.getItem(client.url.host + "@" + key);
				};

			case "setItem":
				return (key: string, value: string) => {
					return target.setItem(client.url.host + "@" + key, value);
				};

			case "removeItem":
				return (key: string) => {
					return target.removeItem(client.url.host + "@" + key);
				};

			case "clear":
				return () => {
					for (const key in Object.keys(target)) {
						if (key.startsWith(client.url.host)) {
							target.removeItem(key);
						}
					}
				};

			case "key":
				return (index: number) => {
					const keys = Object.keys(target).filter((key) =>
						key.startsWith(client.url.host)
					);

					return target.getItem(keys[index]);
				};

			case "length":
				return Object.keys(target).filter((key) =>
					key.startsWith(client.url.host)
				).length;

			default:
				if (prop in Object.prototype) {
					return Reflect.get(target, prop);
				}
				console.log("GET", prop, target == realLocalStorage);

				return target.getItem(client.url.host + "@" + (prop as string));
		}
	},

	set(target, prop, value) {
		if (target == realLocalStorage)
			console.log("SET", prop, value, target === realLocalStorage);
		target.setItem(client.url.host + "@" + (prop as string), value);

		return true;
	},

	ownKeys(target) {
		return Reflect.ownKeys(target)
			.filter((f) => typeof f === "string" && f.startsWith(client.url.host))
			.map((f) => f.substring(client.url.host.length + 1));
	},

	getOwnPropertyDescriptor(target, property) {
		return {
			value: target.getItem(client.url.host + "@" + (property as string)),
			enumerable: true,
			configurable: true,
			writable: true,
		};
	},

	defineProperty(target, property, attributes) {
		target.setItem(
			client.url.host + "@" + (property as string),
			attributes.value
		);

		return true;
	},
};

const realLocalStorage = window.localStorage;
const realSessionStorage = window.sessionStorage;

const localStorageProxy = new Proxy(window.localStorage, handler);
const sessionStorageProxy = new Proxy(window.sessionStorage, handler);

delete window.localStorage;
delete window.sessionStorage;

window.localStorage = localStorageProxy;
window.sessionStorage = sessionStorageProxy;
