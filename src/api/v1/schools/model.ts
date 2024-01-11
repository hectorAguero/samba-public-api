import { School, SchoolTranslated, SchoolTranslation } from './schemas.ts';



export const getSchools = async (
    language: string,
): Promise<SchoolTranslated[]> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.json`);
    const schoolTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.json`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolTranslation).filter((school: SchoolTranslation) => school.languageCode === language);
    return schoolList.map((school: School) => {
        const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.schoolId === school.id);
        const { symbols, colors } = schoolTranslation!;
        return {
            ...school,
            symbols,
            colors
        };
    });
};

export const getSchoolById = async (
    id: number,
    language: string,
): Promise<SchoolTranslated | null> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.json`);
    const schoolsTranslations = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.json`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolsTranslations).filter((school: SchoolTranslation) => school.languageCode === language);
    const school = schoolList.find((school: School) => school.id === id);
    if (!school) return null;
    const translation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.schoolId == school!.id)!;
    const { symbols, colors } = translation;
    return {
        ...school,
        symbols,
        colors
    };
};