import {
	getInstrumentData,
	translateInstrument,
	filterDataList,
	sortDataList,
} from "./model_utils.ts";
import type { InstrumentsGetRequest } from "./routes_schemas.ts";
import {
	type TranslatedInstrument,
	translatedInstrumentSchema,
} from "./schemas.ts";

export async function getInstruments({
	language = "en",
	filter,
	sort = "name",
	sortOrder = "asc",
	page = 1,
	pageSize = 10,
}: InstrumentsGetRequest): Promise<TranslatedInstrument[]> {
	const [instrumentList, instrumentTranslations] =
		await getInstrumentData(language);
	let translatedInstruments = instrumentList.map((instrument) =>
		translateInstrument(instrument, instrumentTranslations),
	);
	if (filter) {
		translatedInstruments = filterDataList(
			translatedInstruments,
			filter.toString(),
		);
	}
	const sortedInstruments = sortDataList(
		translatedInstruments,
		sort,
		sortOrder,
	);

	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return sortedInstruments.slice(startIndex, endIndex);
}

export async function getInstrumentById(
	id: number,
	language: string,
): Promise<TranslatedInstrument | null> {
	const [instrumentList, instrumentTranslations] =
		await getInstrumentData(language);
	const instrument = instrumentList.find((p) => p.id === id);
	if (instrument) {
		const translatedInstrument = translateInstrument(
			instrument,
			instrumentTranslations,
		);
		return translatedInstrumentSchema.parse({
			...translatedInstrument,
			instrument,
		});
	}
	return null;
}
