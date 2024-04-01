import { translatedInstrumentSchema } from "./schemas.ts";
import type {
	Instrument,
	InstrumentTranslation,
	TranslatedInstrument,
} from "./schemas.ts";

export async function getInstrumentData(
	language: string,
): Promise<[Instrument[], InstrumentTranslation[]]> {
	const instrumentFilePath = `${Deno.cwd()}/assets/static/json/instruments.jsonc`;
	const translationFilePath = `${Deno.cwd()}/assets/static/json/instruments_translations.jsonc`;

	const instrumentFileContents = await Deno.readTextFile(instrumentFilePath);
	const translationFileContents = await Deno.readTextFile(translationFilePath);

	const instrumentList: Instrument[] = JSON.parse(instrumentFileContents);
	const instrumentTranslations: InstrumentTranslation[] = JSON.parse(
		translationFileContents,
	);

	const filteredTranslations = instrumentTranslations.filter(
		(translation) => translation.languageCode === language,
	);

	return [instrumentList, filteredTranslations];
}

export function translateInstrument(
	instrument: Instrument,
	translations: InstrumentTranslation[],
): TranslatedInstrument {
	const imageServer = Deno.env.get("IMAGE_SERVER");
	const translation = translations.find(
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
