import type { KVNamespace } from "@cloudflare/workers-types";
declare const __STATIC_CONTENT: KVNamespace;
declare const __STATIC_CONTENT_MANIFEST: string;

export type KVAssetOptions = {
	manifest?: object | string;
	namespace?: KVNamespace;
};

export const getKVAsset = async (
	path: string,
	options?: KVAssetOptions,
): Promise<ArrayBuffer | null> => {
	let optionsCopy = options;
	if (globalThis.process && process.env.NODE_ENV === "test") {
		// Do nothing
	} else {
		optionsCopy ??= {};
		// @ts-expect-error __STATIC_CONTENT_MANIFEST is not typed
		const manifest = await import("__STATIC_CONTENT_MANIFEST");
		optionsCopy.manifest = manifest.default;
	}

	let ASSET_MANIFEST: Record<string, string> = {};
	if (optionsCopy?.manifest) {
		if (typeof optionsCopy.manifest === "string") {
			ASSET_MANIFEST = JSON.parse(optionsCopy.manifest);
		} else {
			ASSET_MANIFEST = optionsCopy.manifest as Record<string, string>;
		}
	} else {
		if (typeof __STATIC_CONTENT_MANIFEST === "string") {
			ASSET_MANIFEST = JSON.parse(__STATIC_CONTENT_MANIFEST);
		} else {
			ASSET_MANIFEST = __STATIC_CONTENT_MANIFEST;
		}
	}

	let ASSET_NAMESPACE: KVNamespace;
	if (optionsCopy?.namespace) {
		ASSET_NAMESPACE = optionsCopy.namespace;
	} else {
		ASSET_NAMESPACE = __STATIC_CONTENT;
	}

	const key = ASSET_MANIFEST[path] ?? path;

	if (!key) {
		return null;
	}

	const content = await ASSET_NAMESPACE.get(key, { type: "arrayBuffer" });
	if (!content) {
		return null;
	}
	return content as unknown as ArrayBuffer;
};

export const bufferToJSON = (arrayBuffer: ArrayBuffer) => {
	if (arrayBuffer instanceof ArrayBuffer) {
		const text = new TextDecoder().decode(arrayBuffer);
		if (text) return JSON.parse(text);
	} else {
		return arrayBuffer;
	}
};

export async function hashPassword(
	password: string,
	providedSalt?: Uint8Array,
): Promise<string> {
	const encoder = new TextEncoder();
	// Use provided salt if available, otherwise generate a new one
	const salt = providedSalt || crypto.getRandomValues(new Uint8Array(16));
	const saltBuffer = new ArrayBuffer(salt.buffer.byteLength);
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits", "deriveKey"],
	);
	const key = await crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: saltBuffer,
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"],
	);
	const exportedKey = (await crypto.subtle.exportKey(
		"raw",
		key,
	)) as ArrayBuffer;
	const hashBuffer = new Uint8Array(exportedKey);
	const hashArray = Array.from(hashBuffer);
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	const saltHex = Array.from(salt)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return `${saltHex}:${hashHex}`;
}

export async function verifyPassword({
	storedHash,
	passwordAttempt,
}: { storedHash: string; passwordAttempt: string }): Promise<boolean> {
	const [saltHex, originalHash] = storedHash.split(":");
	const matchResult = saltHex.match(/.{1,2}/g);
	if (!matchResult) {
		throw new Error("Invalid salt format");
	}
	const salt = new Uint8Array(
		matchResult.map((byte) => Number.parseInt(byte, 16)),
	);
	const attemptHashWithSalt = await hashPassword(passwordAttempt, salt);
	const [, attemptHash] = attemptHashWithSalt.split(":");
	return attemptHash === originalHash;
}
