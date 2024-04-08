import type { School, SchoolTranslation, TranslatedSchool } from "./schemas.ts";
import "@std/dotenv/load";
import { translatedSchoolSchema } from "./schemas.ts";

export async function getSchoolData(
	language: string,
): Promise<[School[], SchoolTranslation[]]> {
	const schoolFilePath = `${Deno.cwd()}/assets/static/json/schools.jsonc`;
	const translationFilePath = `${Deno.cwd()}/assets/static/json/schools_translations.jsonc`;

	const schoolFileContents = await Deno.readTextFile(schoolFilePath);
	const translationFileContents = await Deno.readTextFile(translationFilePath);

	const schoolList: School[] = JSON.parse(schoolFileContents);
	const schoolTranslations: SchoolTranslation[] = JSON.parse(
		translationFileContents,
	);

	const filteredTranslations = schoolTranslations.filter(
		(translation) => translation.languageCode === language,
	);

	return [schoolList, filteredTranslations];
}

export function translateSchool(
	school: School,
	translations: SchoolTranslation[],
): TranslatedSchool {
	const translation = translations.find((t) => t.schoolId === school.id);
	return translatedSchoolSchema.parse({
		...translation,
		...school,
		imageUrl: `${Deno.env.get("IMAGE_SERVER")}${school.imageUrl}`,
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
			previous = `${prevParade.divisionNumber}${
				prevParade.subdivisionNumber ?? 0
			}_${previous.toString().padStart(2, "0")}`;

			next = `${nextParade.divisionNumber}${
				nextParade.subdivisionNumber ?? 0
			}_${next.toString().padStart(2, "0")}`;
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
