import { School, SchoolAllSelect, SchoolTranslated, SchoolTranslation } from './schemas.ts';



export const getSchools = async (
    { language, sort, sortOrder, ...query }: SchoolAllSelect,
): Promise<SchoolTranslated[]> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.jsonc`);
    const schoolTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.jsonc`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolTranslation).filter((school: SchoolTranslation) => school.languageCode === language);
    let data = schoolList.map((school: School) => {
        const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.schoolId === school.id);
        const { languageCode: _languageCode, schoolId: _schoolId, id: _id, ...translation } = schoolTranslation!;
        return {
            ...school,
            ...translation
        };
    });

    if (sort !== undefined) {
        if (sortOrder === undefined) sortOrder = 'asc';
        data = data.sort((a: SchoolTranslated, b: SchoolTranslated) => {
            if (sortOrder === 'asc') return a[sort as keyof SchoolTranslated] > b[sort as keyof SchoolTranslated] ? 1 : -1;
            return a[sort as keyof SchoolTranslated] < b[sort as keyof SchoolTranslated] ? 1 : -1;
        });
    }
    if (query.page !== undefined) {
        if (query.pageSize === undefined) query.pageSize = 10;
        data = data.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
    }
    if (query.filter !== undefined) {
        const filter = query.filter.toString().split(';').map((filter: string) => { // Explicitly specify the type of the parameter
            const [key, value] = filter.split('=');
            return { key, value };
        });
        for (const { key, value } of filter) {
            data = data.filter((school: SchoolTranslated) => school[key as keyof SchoolTranslated].toString().toLocaleUpperCase().includes(value.toLocaleUpperCase()));
        }
    }

    return data;
};

export const getSchoolById = async (
    id: number,
    language: string,
): Promise<SchoolTranslated | null> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()} / assets / static / json / schools.jsonc`);
    const schoolsTranslations = await Deno.readTextFile(`${Deno.cwd()} / assets / static / json / schools_translations.jsonc`);
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