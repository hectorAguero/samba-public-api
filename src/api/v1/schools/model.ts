import { School, SchoolTranslation, SchoolTranslated } from './schemas.ts';


export const getSchools = async (
    language: string,
): Promise<SchoolTranslated[]> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.json`);
    const schoolTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.json`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolTranslation).filter((school: SchoolTranslation) => school.language === language);
    return schoolList.map((school: School) => {
        const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.id === school.id);
        return {
            ...school,
            ...schoolTranslation,
        };
    });
};