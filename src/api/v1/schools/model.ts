import type { School, SchoolAllSelect, SchoolTranslated, SchoolTranslation } from './schemas.ts';
import "@std/dotenv/load";



export const getSchools = async (
    { language, sort, sortOrder, ...query }: SchoolAllSelect,
): Promise<SchoolTranslated[]> => {
    const schoolFile = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools.jsonc`);
    const schoolTranslation = await Deno.readTextFile(`${Deno.cwd()}/assets/static/json/schools_translations.jsonc`);
    const schoolList: School[] = JSON.parse(schoolFile);
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolTranslation)
        .filter((school: SchoolTranslation) => school.languageCode === language);

    let data = schoolList.map((school: School) => {
        const schoolTranslation = schoolTranslationList
            .find((schoolTranslation: SchoolTranslation) => schoolTranslation.schoolId === school.id);
        let translation = {};
        if (schoolTranslation) {
            const { languageCode: _language_code, schoolId: _school_id, id: _id, ...fields } = schoolTranslation;
            translation = fields;
        }


        return {
            ...school,
            imageUrl: `${Deno.env.get("IMAGE_SERVER")}${school.imageUrl}`,
            ...translation,
            originalName: school.name,
            originalColors: school.colors,
            originalSymbols: school.symbols,
        };
    });

    // Si quieres ordenar específicamente por divisionNumber y lastPosition
    if (sort === undefined || sort === 'divisionNumber' || sort === 'lastPosition') {
        sortOrder ??= 'asc';
        data = data.sort((firstSchool, secondSchool) => {
            // Combina los dos campos para la comparación
            const firstSchoolPosition = `${firstSchool.divisionNumber}-${secondSchool.lastPosition}`;
            const secondSchoolPosition = `${firstSchool.divisionNumber}-${secondSchool.lastPosition}`;

            // Compara las combinaciones para el ordenamiento
            if (sortOrder === 'asc') {
                return firstSchoolPosition > secondSchoolPosition ? 1 : -1;
            }
            return firstSchoolPosition < secondSchoolPosition ? 1 : -1;
        });
    } else {
        sort ??= 'id';
        sortOrder ??= 'asc';
        // Ordenamiento estándar basado en el campo sort
        data = data.sort((a: SchoolTranslated, b: SchoolTranslated) => {
            if (sortOrder === 'asc') return a[sort as keyof SchoolTranslated] > b[sort as keyof SchoolTranslated] ? 1 : -1;
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
                    return lookUpValue.split(',').every((lookUpItem: string) =>
                        array.some((item) => item.toLocaleUpperCase().includes(lookUpItem.trim()))
                    );
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
        if (query.pageSize === undefined) query.pageSize = 10;
        data = data.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
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
    const schoolTranslationList: SchoolTranslation[] = JSON.parse(schoolsTranslations).filter((school: SchoolTranslation) => school.languageCode === language);
    const school = schoolList.find((school: School) => school.id === id);
    if (!school || !schoolTranslationList) return null;
    const schoolTranslation = schoolTranslationList.find((schoolTranslation: SchoolTranslation) => schoolTranslation.schoolId === school.id);
    let translation = {};
    if (schoolTranslation) {
        const { languageCode: _languageCode, schoolId: _schoolId, id: _id, ...fields } = schoolTranslation;
        translation = fields;
    }

    return {
        ...school,
        ...translation,
        originalName: school.name,
        originalColors: school.colors,
        originalSymbols: school.symbols,
    };
};