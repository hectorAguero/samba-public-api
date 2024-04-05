import type { School, SchoolTranslation, TranslatedSchool } from "./schemas.ts";
import { translatedSchoolSchema } from "./schemas.ts";
import { bufferToJSON, getKVAsset as getKVAssets } from "../workers_util.ts";

export async function getSchoolData({
	language,
	namespace,
}: { language: string; namespace: KVNamespace<string> | undefined }): Promise<
	[School[], SchoolTranslation[]]
> {
	const schoolFilePath = "static/json/schools.jsonc";
	const translationFilePath = "static/json/schools_translations.jsonc";
	const schoolFile = await getKVAssets(schoolFilePath, { namespace });
	const intlFile = await getKVAssets(translationFilePath, { namespace });
	if (!schoolFile || !intlFile) {
		throw new Error("Failed to fetch data");
	}
	const schoolList: School[] = await bufferToJSON(schoolFile);
	const translations: SchoolTranslation[] = await bufferToJSON(intlFile);
	const filteredTranslations = translations.filter(
		(translation) => translation.languageCode === language,
	);
	return [schoolList, filteredTranslations];
}

export function translateSchool({
	school,
	translations,
	imageServer,
}: {
	school: School;
	translations: SchoolTranslation[];
	imageServer: string;
}): TranslatedSchool {
	const translation = translations.find((t) => t.schoolId === school.id);
	return translatedSchoolSchema.parse({
		...translation,
		...school,
		imageUrl: `${imageServer}${school.imageUrl}`,
		translatedName: translation?.name ?? school.name,
		translatedColors: translation?.colors ?? school.colors,
		translatedSymbols: translation?.symbols ?? school.symbols,
		translatedGodmotherSchool:
			translation?.godmotherSchool ?? school.godmotherSchool,
		translatedCountry: translation?.country ?? school.country,
		translatedLeagueLocation:
			translation?.leagueLocation ?? school.leagueLocation,
	});
}

export const sortDataList = (
	dataList: TranslatedSchool[],
	sort: string,
	sortOrder: string,
) => {
	const sortOrderDirection = sortOrder === "desc" ? -1 : 1;

	return dataList.sort((prevParade, nextParade) => {
		let previous = prevParade[sort as keyof TranslatedSchool] ?? 0;
		let next = nextParade[sort as keyof TranslatedSchool] ?? 0;
		if (sort === "lastPosition" || sort === undefined) {
			previous = Number.parseInt(`${prevParade.divisionNumber}${previous}`);
			next = Number.parseInt(`${nextParade.divisionNumber}${next}`);
		}
		return (previous > next ? 1 : -1) * sortOrderDirection;
	});
};

export const filterDataList = (
	dataList: TranslatedSchool[],
	filters: string,
) => {
	const parsedFilters = filters.split(";").map((filterPart) => {
		const [key, value] = filterPart.split("=").map((s) => s.trim());
		return { key, value };
	});

	return dataList.filter((school) => {
		return parsedFilters.every(({ key, value }) => {
			const schoolValue = school[key as keyof TranslatedSchool];

			if (Array.isArray(schoolValue)) {
				const schoolArray = schoolValue.map((item) =>
					item.toLocaleUpperCase().trim(),
				);
				const orGroups = value
					.toUpperCase()
					.split(",")
					.map((item) => item.trim());

				return orGroups.some((group) => {
					const andGroups = group
						.split(":")
						.map((item) => item.trim().toLocaleUpperCase());
					// return andGroups.every((andItem) => schoolArray.includes(andItem));
					return andGroups.every((andItem) =>
						schoolArray.some((schoolItem) => schoolItem.includes(andItem)),
					);
				});
			}
			if (typeof schoolValue === "string") {
				const paramValue = value.toLocaleUpperCase();
				if (paramValue === "NULL") {
					return schoolValue === null || schoolValue === "";
				}
				return (schoolValue as string).toLocaleUpperCase().includes(paramValue);
			}
			if (typeof schoolValue === "number") {
				return schoolValue === Number(value);
			}
			return false;
		});
	});
};
