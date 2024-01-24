import { School, SchoolAllSelect, SchoolTranslated, SchoolTranslation } from './schemas.ts';



export const getSchools = async (
    { language, sort, sort_order, ...query }: SchoolAllSelect,
): Promise<SchoolTranslated[]> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.jsonc`);
    const schoolTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.jsonc`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolTranslation).filter((school: SchoolTranslation) => school.language_code === language);
    let data = schoolList.map((school: School) => {
        const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.school_id === school.id);
        const { language_code: _language_code, school_id: _school_id, id: _id, ...translation } = schoolTranslation!;
        return {
            ...school,
            ...translation
        };
    });

    if (sort !== undefined || sort_order !== undefined) {
        sort ??= 'id';
        sort_order ??= 'asc';
        data = data.sort((a: SchoolTranslated, b: SchoolTranslated) => {
            if (sort_order === 'asc') return a[sort as keyof SchoolTranslated] > b[sort as keyof SchoolTranslated] ? 1 : -1;
            return a[sort as keyof SchoolTranslated] < b[sort as keyof SchoolTranslated] ? 1 : -1;
        });
    }

    if (query.filter !== undefined) {
        const filter = query.filter.toString().split(';').map((filter: string) => { // Explicitly specify the type of the parameter
            const [key, value] = filter.split('=');
            return { key, value };
        });
        for (const { key, value } of filter) {
            const lookUpValue = value?.trim().toLocaleUpperCase();
            data = data.filter((school: SchoolTranslated) => {
                const schoolValue = school[key as keyof SchoolTranslated];
                if (Array.isArray(schoolValue)) {
                    const array = schoolValue as string[];
                    return lookUpValue.split(',').every((lookUpItem) => {
                        lookUpItem = lookUpItem.trim();
                        return array.some((item) => item.toLocaleUpperCase().includes(lookUpItem));
                    });
                }
                if (typeof schoolValue === 'string') {
                    if (lookUpValue === "NULL") return schoolValue === null || schoolValue === '';
                    return (schoolValue as string).toLocaleUpperCase().includes(lookUpValue);
                }
                if (typeof schoolValue === 'number') {
                    return schoolValue === Number(value);
                }
                return false;
            });
        };
    }
    if (query.page !== undefined) {
        if (query.page_size === undefined) query.page_size = 10;
        data = data.slice((query.page - 1) * query.page_size, query.page * query.page_size);
    }

    return data;
};

export const getSchoolById = async (
    id: number,
    language: string,
): Promise<SchoolTranslated | null> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.jsonc`);
    const schoolsTranslations = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.jsonc`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolsTranslations).filter((school: SchoolTranslation) => school.language_code === language);
    const school = schoolList.find((school: School) => school.id === id);
    if (!school) return null;
    const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.school_id == school!.id)!;
    const { language_code: _language_code, school_id: _school_id, id: _id, ...translation } = schoolTranslation!;
    return {
        ...school,
        ...translation,
    };
};