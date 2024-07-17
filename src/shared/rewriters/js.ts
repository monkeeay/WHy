import { parseModule } from "meriyah";
import { generate } from "astring";
import { makeTraveler } from "astravel";
import { decodeUrl, encodeUrl } from "./url";
import * as ESTree from "estree";

// i am a cat. i like to be petted. i like to be fed. i like to be

// js rewiter is NOT finished

// location
// window
// self
// globalThis
// this
// top
// parent

import { initSync, rewrite_js } from "../../../rewriter/out/rewriter.js";
import "../../../static/wasm.js";

initSync(new WebAssembly.Module(
	Uint8Array.from(atob(self.WASM), c => c.charCodeAt(0))
))

global.rws = rewriteJs;
export function rewriteJs(js: string | ArrayBuffer, origin?: URL) {
	if ("window" in globalThis)
		origin ??= new URL(decodeUrl(location.href));

	let before = performance.now();
	if (typeof js === "string") {
		js = rewrite_js(js, origin.toString());
	} else {
		js = new TextDecoder().decode(js);
		js = rewrite_js(js, origin.toString());
	}
	let after = performance.now();

	console.log("Rewrite took", Math.floor((after - before) * 10) / 10, "ms");
	//
	// let offset = 0;
	//
	// for (const rewrite of rewrites) {
	// 	if (rewrite.genericchange) {
	// 		let change = rewrite.genericchange;
	// 		let start = change.span.start + offset;
	// 		let end = change.span.end + offset;
	// 		let len = end - start;
	//
	// 		js = js.slice(0, start) + change.text + js.slice(end);
	//
	// 		offset += change.text.length - len;
	// 	}
	// }
	// console.log(js)
	//
	return js;

	// console.log(f)
	//
	// return f
	// try {
	// 	const ast = parseModule(js, {
	// 		module: true,
	// 		webcompat: true,
	// 	});
	//
	// 	const identifierList = [
	// 		"window",
	// 		"self",
	// 		"globalThis",
	// 		"this",
	// 		"parent",
	// 		"top",
	// 		"location",
	// 	];
	//
	// 	const customTraveler = makeTraveler({
	// 		ImportDeclaration: (node: ESTree.ImportDeclaration) => {
	// 			node.source.value = encodeUrl(node.source.value as string, origin);
	// 		},
	//
	// 		ImportExpression: (node: ESTree.ImportExpression) => {
	// 			if (node.source.type === "Literal") {
	// 				node.source.value = encodeUrl(node.source.value as string, origin);
	// 			} else if (node.source.type === "Identifier") {
	// 				// this is for things that import something like
	// 				// const moduleName = "name";
	// 				// await import(moduleName);
	// 				node.source.name = `__wrapImport(${node.source.name})`;
	// 			}
	// 		},
	//
	// 		ExportAllDeclaration: (node: ESTree.ExportAllDeclaration) => {
	// 			node.source.value = encodeUrl(node.source.value as string, origin);
	// 		},
	//
	// 		ExportNamedDeclaration: (node: ESTree.ExportNamedDeclaration) => {
	// 			// strings are Literals in ESTree syntax but these will always be strings
	// 			if (node.source)
	// 				node.source.value = encodeUrl(node.source.value as string, origin);
	// 		},
	//
	// 		MemberExpression: (node: ESTree.MemberExpression) => {
	// 			if (
	// 				node.object.type === "Identifier" &&
	// 				identifierList.includes(node.object.name)
	// 			) {
	// 				node.object.name = `globalThis.$s(${node.object.name})`;
	// 			}
	// 		},
	//
	// 		AssignmentExpression: (node: ESTree.AssignmentExpression, more) => {
	// 			if (
	// 				node.left.type === "Identifier" &&
	// 				identifierList.includes(node.left.name)
	// 			) {
	// 				node.left.name = `globalThis.$s(${node.left.name})`;
	// 			}
	//
	// 			if (
	// 				node.right.type === "Identifier" &&
	// 				identifierList.includes(node.right.name)
	// 			) {
	// 				node.right.name = `globalThis.$s(${node.right.name})`;
	// 			}
	// 		},
	// 		ArrayExpression: (node: ESTree.ArrayExpression) => {
	// 			node.elements.forEach((element) => {
	// 				if (element.type === "Identifier" && identifierList.includes(element.name)) {
	// 					element.name = `globalThis.$s(${element.name})`;
	// 				}
	// 			});
	// 		},
	//
	// 		VariableDeclarator: (node: ESTree.VariableDeclarator) => {
	// 			if (
	// 				node.init &&
	// 				node.init.type === "Identifier" &&
	// 				identifierList.includes(node.init.name)
	// 			) {
	// 				node.init.name = `globalThis.$s(${node.init.name})`;
	// 			}
	// 		},
	// 	});
	//
	// 	customTraveler.go(ast);
	//
	// 	return generate(ast);
	// } catch (e) {
	// 	console.error(e);
	// 	console.log(js);
	//
	// 	return js;
	// }
}

