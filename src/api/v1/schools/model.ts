import { School, SchoolTranslated, SchoolTranslation } from './schemas.ts';



export const getSchools = async (
    language: string,
): Promise<SchoolTranslated[]> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.jsonc`);
    const schoolTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.jsonc`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolTranslation).filter((school: SchoolTranslation) => school.languageCode === language);
    return schoolList.map((school: School) => {
        const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.schoolId === school.id);
        const { languageCode: _languageCode, schoolId: _schoolId, id: _id, ...translation } = schoolTranslation!;
        return {
            ...school,
            ...translation
        };
    });
};

export const getSchoolById = async (
    id: number,
    language: string,
): Promise<SchoolTranslated | null> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.jsonc`);
    const schoolsTranslations = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.jsonc`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolsTranslations).filter((school: SchoolTranslation) => school.languageCode === language);
    const school = schoolList.find((school: School) => school.id === id);
    if (!school) return null;
    const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.schoolId == school!.id)!;
    const { languageCode: _languageCode, schoolId: _schoolId, id: _id, ...translation } = schoolTranslation!;
    return {
        ...school,
        ...translation,
    };
};