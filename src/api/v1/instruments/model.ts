import { searchItems } from "../../utils/search_array.ts";
import {
	type TranslatedInstrument,
	translatedInstrumentSchema,
} from "./schemas.ts";
import {
	instrumentsSearchWeights,
	getInstrumentData,
	translateInstrument,
	filterDataList,
	sortDataList,
} from "./model_utils.ts";
import type {
	InstrumentsGetRequest,
	InstrumentsSearchRequest,
} from "./routes_schemas.ts";

export async function getInstruments({
	language = "en",
	filter,
	sort = "name",
	sortOrder = "asc",
	page = 1,
	pageSize = 10,
	ids,
}: InstrumentsGetRequest): Promise<TranslatedInstrument[]> {
	const [instrumentList, instrumentTranslations] = await getInstrumentData(
		language,
		ids,
	);
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

export async function searchInstruments({
	language = "en",
	filter,
	sort = "name",
	sortOrder = "asc",
	page = 1,
	pageSize = 10,
	search,
}: InstrumentsSearchRequest): Promise<TranslatedInstrument[]> {
	const [instruments, translations] = await getInstrumentData(language);
	let results = instruments.map((instrument) =>
		translateInstrument(instrument, translations),
	);

	results = searchItems<TranslatedInstrument>(
		results,
		search,
		instrumentsSearchWeights,
	);

	if (filter) {
		results = filterDataList(results, filter.toString());
	}
	results = sortDataList(results, sort, sortOrder);
	const startIndex = (page - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	return results.slice(startIndex, endIndex);
}
