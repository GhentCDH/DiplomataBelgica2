import {FormGeneratorFieldCreator, type Schema, type Field} from "@ghentcdh/vue-search-kit";

type Translator = (key: string, params?: any) => string
type AutocompleteCallback = (fieldName: string) => ((fieldName: string, query: string) => void)

export interface SchemaOptions {
    t: Translator,
    onAutocomplete: AutocompleteCallback,
    /** url of the search syntax help page, linked below the summary and full-text fields */
    searchSyntaxUrl?: string,
}

export const createSchema = (schemaOptions: SchemaOptions): Schema => {

    const {t, onAutocomplete, searchSyntaxUrl} = schemaOptions

    const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
    const searchSyntaxHint = searchSyntaxUrl
        ? {
            hint: `<a href="${escapeHtml(searchSyntaxUrl)}" target="_blank">${escapeHtml(t('charters.form.searchSyntaxLink'))}</a>`,
            hintHtml: true,
        }
        : {}
    const actorFieldIsVisible = (model: any, field: Field) => {

        function getActorFields(index: number) {
            return [
                'actor_name_full_name_' + index,
                'actor_role_' + index,
                'actor_capacity_' + index,
                'actor_place_name_' + index,
                'actor_place_diocese_name_' + index,
                'actor_place_principality_name_' + index,
                'actor_order_name_' + index,
            ]
        }

        const modelKey = field.model
        const actorIndex = Number(modelKey.split('_').pop())
        const actorFields = [...getActorFields(actorIndex), ...(actorIndex > 1 ? getActorFields(actorIndex - 1) : [])]
        let res = actorFields.filter((key) => model?.[key] && model?.[key]?.length > 0)
        return res.length > 0
    }


    // Fields of one actor block, in the order actors are displayed in the results:
    // role, function, institution, name, diocese, principality, religious order.
    // Blocks 2 and 3 only show up once the previous block is used.
    const actorFields = (index: number): Field[] => {
        const common = (key: string, model: string, extra: Record<string, any> = {}) => ({
            model: `${model}_${index}`,
            styleClasses: `actor actor-${index}`,
            help: t(`charters.form.field.${key}.help`),
            placeholder: t(`charters.form.field.${key}.placeholder`),
            ...(index > 1 ? {visible: actorFieldIsVisible} : {}),
            ...extra,
        })

        return [
            {
                type: 'label',
                label: t('charters.form.field.actor.label', {index}),
                model: `actor_${index}`,
                styleClasses: `actor actor-${index}`,
                ...(index > 1 ? {visible: actorFieldIsVisible} : {}),
            },
            FormGeneratorFieldCreator.createMultiSelect(t('charters.form.field.actor_role.label'),
                common('actor_role', 'actor_role')),
            FormGeneratorFieldCreator.createMultiSelect(t('charters.form.field.actor_function.label'),
                common('actor_function', 'actor_capacity')),
            FormGeneratorFieldCreator.createMultiSelect(t('charters.form.field.actor_institution.label'),
                common('actor_institution', 'actor_place_name')),
            FormGeneratorFieldCreator.createMultiSelect(t('charters.form.field.actor_name.label'),
                common('actor_name', 'actor_name_full_name'),
                {onSearch: onAutocomplete(`actor_name_full_name_${index}`), internalSearch: false}),
            FormGeneratorFieldCreator.createMultiSelect(t('charters.form.field.actor_diocese.label'),
                common('actor_diocese', 'actor_place_diocese_name')),
            FormGeneratorFieldCreator.createMultiSelect(t('charters.form.field.actor_principality.label'),
                common('actor_principality', 'actor_place_principality_name')),
            FormGeneratorFieldCreator.createMultiSelect(t('charters.form.field.actor_order.label'),
                common('actor_order', 'actor_order_name', {styleClasses: `actor actor-${index} !mbottom-default`})),
        ]
    }

    return {
        groups: [
            {
                styleClasses: 'collapsible',
                legend: t('charters.form.legend.identification'),
                fields: [
                    {
                        type: 'input',
                        inputType: 'text',
                        label: t('charters.form.field.charter_id.label'),
                        help: t('charters.form.field.charter_id.help'),
                        labelClasses: 'form-label',
                        placeholder: t('charters.form.field.charter_id.placeholder'),
                        model: 'id',
                        validateDebounceTime: 1000,
                    },
                    FormGeneratorFieldCreator.createMultiSelect('Language',
                        {
                            model: 'charter_language',
                            label: t('charters.form.field.language.label'),
                            help: t('charters.form.field.language.help'),
                            placeholder: t('charters.form.field.language.placeholder'),
                        }
                    )
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t('charters.form.legend.actors'),
                fields: [
                    ...actorFields(1),
                    ...actorFields(2),
                    ...actorFields(3),
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t('charters.form.legend.datation'),
                fields: [
                    {
                        type: 'DMYRange',
                        model: 'dating_scholary',
                        label: t('charters.form.field.date_scholarly_any.label'),
                        help: t('charters.form.field.date_scholarly_any.help'),
                        labelClasses: 'form-label',
                        validateDebounceTime: 1000,
                    },
                    {
                        type: 'checkboxBS5',
                        model: 'dating_scholary_preferential',
                        label: t('charters.form.field.date_scholarly_preferential.label'),
                        help: t('charters.form.field.date_scholarly_preferential.help'),

                        labelClasses: 'd-none',
                        default: true,
                    },
                    {
                        type: 'DMYRange',
                        model: 'dating_charter',
                        label: t('charters.form.field.date_unconverted.label'),
                        help: t('charters.form.field.date_unconverted.help'),
                        labelClasses: 'form-label',
                        validateDebounceTime: 1000,
                    },
                    FormGeneratorFieldCreator.createMultiSelect(t('charters.form.field.place_date.label'), {
                        model: 'charter_place_name',
                        help: t('charters.form.field.place_date.help'),
                        placeholder: t('charters.form.field.place_date.placeholder'),
                    }),
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t('charters.form.legend.analysis'),
                fields: [
                    {
                        type: 'input',
                        inputType: 'text',
                        model: 'summary',
                        label: t('charters.form.field.summary.label'),
                        help: t('charters.form.field.summary.help'),
                        placeholder: t('charters.form.field.summary.placeholder'),
                        labelClasses: 'form-label',
                        validateDebounceTime: 1000,
                        ...searchSyntaxHint,
                    },
                    {
                        type: 'input',
                        inputType: 'text',
                        model: 'fulltext',
                        label: t('charters.form.field.fulltext.label'),
                        help: t('charters.form.field.fulltext.help'),
                        placeholder: t('charters.form.field.fulltext.placeholder'),
                        labelClasses: 'form-label',
                        validateDebounceTime: 1000,
                        ...searchSyntaxHint,
                    },
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t('charters.form.legend.images'),
                fields: [
                    {
                        label: t('charters.form.field.images.label'),
                        help: t('charters.form.field.images.help'),
                        type: 'checkboxBS5',
                        model: 'has_images',
                        labelClasses: 'd-none',
                    },
                ]
            },
        ],
    }
}