import { bufferToJSON, getKVAsset } from "../workers_util.ts";
import { translatedInstrumentSchema } from "./schemas.ts";
import type {
	Instrument,
	InstrumentTranslation,
	TranslatedInstrument,
} from "./schemas.ts";
import { env } from "hono/adapter";

export async function getInstrumentData({
	language,
	namespace,
}: { language: string; namespace: KVNamespace<string> | undefined }): Promise<
	[Instrument[], InstrumentTranslation[]]
> {
	const instrumensPath = "static/json/instruments.jsonc";
	const translationsPath = "static/json/instruments_translations.jsonc";

	const instrumentFile = await getKVAsset(instrumensPath, { namespace });
	const intlFile = await getKVAsset(translationsPath, { namespace });
	if (!instrumentFile || !intlFile) {
		throw new Error("Failed to fetch data");
	}
	const instruments: Instrument[] = await bufferToJSON(instrumentFile);
	const translations: InstrumentTranslation[] = await bufferToJSON(intlFile);
	const filteredTranslations = translations.filter(
		(translation) => translation.languageCode === language,
	);

	return [instruments, filteredTranslations];
}

export function translateInstrument({
	instrument,
	instrumentTranslations,
	imageServer,
}: {
	instrument: Instrument;
	instrumentTranslations: InstrumentTranslation[];
	imageServer: string;
}): TranslatedInstrument {
	const translation = instrumentTranslations.find(
		(t) => t.instrumentId === instrument.id,
	);
	return translatedInstrumentSchema.parse({
		...translation,
		...instrument,
		imageUrl: `${imageServer}${instrument.imageUrl}`,
		gallery: instrument.gallery.map((item) => `${imageServer}${item}`),
		translatedName: translation?.name ?? instrument.name,
		translatedType: translation?.type ?? instrument.type,
		translatedDescription: translation?.description ?? instrument.description,
	});
}

export const sortDataList = (
	dataList: TranslatedInstrument[],
	sortBy: string,
	sortOrder: string,
) => {
	const sortOrderDirection = sortOrder === "desc" ? -1 : 1;
	return dataList.sort((prevInstrument, nextInstrument) => {
		const previous = prevInstrument[sortBy as keyof TranslatedInstrument] ?? 0;
		const next = nextInstrument[sortBy as keyof TranslatedInstrument] ?? 0;

		return (previous > next ? 1 : -1) * sortOrderDirection;
	});
};

export const filterDataList = (
	dataList: TranslatedInstrument[],
	filters: string,
) => {
	const parsedFilters = filters.split(";").map((filterPart) => {
		const [key, value] = filterPart.split("=").map((s) => s.trim());
		return { key, value };
	});

	return dataList.filter((Instrument) => {
		return parsedFilters.every(({ key, value }) => {
			const instrumentValue = Instrument[key as keyof TranslatedInstrument];
			const lookUpValue = value.toUpperCase();

			if (Array.isArray(instrumentValue)) {
				return value
					.split(",")
					.every((val) =>
						instrumentValue
							.map(String)
							.some((item) =>
								item.toUpperCase().includes(val.trim().toUpperCase()),
							),
					);
			}
			if (typeof instrumentValue === "string") {
				return instrumentValue.toUpperCase().includes(lookUpValue);
			}
			if (typeof instrumentValue === "number") {
				if (value.includes(",")) {
					const [min, max] = value.split(",").map(Number);
					return instrumentValue >= min && instrumentValue <= max;
				}
				return instrumentValue === Number(value);
			}
			return (
				lookUpValue === "NULL" ||
				(lookUpValue === "" && instrumentValue == null)
			);
		});
	});
};
