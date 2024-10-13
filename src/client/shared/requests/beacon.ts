import { rewriteUrl } from "../../../shared";
import { ScramjetClient } from "../../client";

export default function (client: ScramjetClient, self) {
	client.Proxy("navigator.sendBeacon", {
		apply(ctx) {
			ctx.args[0] = rewriteUrl(ctx.args[0], client.meta);
		},
	});
}
