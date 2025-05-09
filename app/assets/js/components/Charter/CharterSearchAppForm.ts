import FormGeneratorFieldCreator from "@/helpers/FormGeneratorFieldCreator";
import {type Schema, type Field} from "@/composables/useVueFormGenerator";

type Translator = (key: string, params?: any) => string
type AutocompleteCallback = (fieldName: string) => ((fieldName: string, query: string) => void)

export interface SchemaOptions {
    t: Translator,
    onAutocomplete: AutocompleteCallback
}

export const createSchema = (schemaOptions: SchemaOptions): Schema => {

    const {t, onAutocomplete} = schemaOptions
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
        const actorIndex = modelKey.split('_').pop()
        const actorFields = [...getActorFields(actorIndex), ...(actorIndex > 1 ? getActorFields(actorIndex - 1) : [])]
        let res = actorFields.filter((key) => model?.[key] && model?.[key]?.length > 0)
        return res.length > 0
    }

    return {
        groups: [
            {
                styleClasses: 'collapsible',
                legend: t('filter.legend.identification'),
                fields: [
                    {
                        type: 'input',
                        inputType: 'text',
                        label: t('filter.field.charter_id.label'),
                        help: t('filter.field.charter_id.help'),
                        labelClasses: 'form-label',
                        placeholder: 'Charter ID',
                        model: 'id',
                        validateDebounceTime: 1000,
                    },
                    FormGeneratorFieldCreator.createMultiSelect('Language',
                        {
                            model: 'charter_language',
                            label: t('filter.field.language.label'),
                            help: t('filter.field.language.help'),
                        }
                    )
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t('filter.legend.actors'),
                fields: [
                    {
                        type: 'label',
                        label: t('filter.field.actor.label', {index: 1}),
                        model: 'actor_1',
                        styleClasses: 'actor actor-1'
                    },
                    FormGeneratorFieldCreator.createMultiSelect(
                        t('filter.field.actor_name.label'),
                        {
                            model: 'actor_name_full_name_1',
                            styleClasses: 'actor actor-1',
                            help: t('filter.field.actor_name.help'),
                        },
                        {onSearch: onAutocomplete('actor_name_full_name_1'), internalSearch: false}
                    ),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_role.label'), {
                        model: 'actor_role_1',
                        styleClasses: 'actor actor-1',
                        help: t('filter.field.actor_role.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_function.label'), {
                        model: 'actor_capacity_1',
                        styleClasses: 'actor actor-1',
                        help: t('filter.field.actor_function.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_institution.label'), {
                        model: 'actor_place_name_1',
                        styleClasses: 'actor actor-1',
                        help: t('filter.field.actor_institution.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_diocese.label'), {
                        model: 'actor_place_diocese_name_1',
                        styleClasses: 'actor actor-1',
                        help: t('filter.field.actor_diocese.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_principality.label'), {
                        model: 'actor_place_principality_name_1',
                        styleClasses: 'actor actor-1',
                        help: t('filter.field.actor_principality.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_order.label'), {
                        model: 'actor_order_name_1',
                        styleClasses: 'actor actor-1 !mbottom-default',
                        help: t('filter.field.actor_order.help'),
                    }),

                    {
                        type: 'label',
                        label: t('filter.field.actor.label', {index: 2}),
                        model: 'actor_2',
                        styleClasses: 'actor actor-2',
                        visible: actorFieldIsVisible
                    },
                    FormGeneratorFieldCreator.createMultiSelect(
                        t('filter.field.actor_name.label'),
                        {
                            model: 'actor_name_full_name_2',
                            styleClasses: 'actor actor-2',
                            visible: actorFieldIsVisible,
                            help: t('filter.field.actor_name.help'),
                        },
                        {onSearch: onAutocomplete('actor_name_full_name_2'), internalSearch: false}
                    ),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_role.label'), {
                        model: 'actor_role_2', styleClasses: 'actor actor-2', visible: actorFieldIsVisible,
                        help: t('filter.field.actor_role.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_function.label'), {
                        model: 'actor_capacity_2',
                        styleClasses: 'actor actor-2', visible: actorFieldIsVisible,
                        help: t('filter.field.actor_function.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_institution.label'), {
                        model: 'actor_place_name_2',
                        styleClasses: 'actor actor-2', visible: actorFieldIsVisible,
                        help: t('filter.field.actor_institution.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_diocese.label'), {
                        model: 'actor_place_diocese_name_2',
                        styleClasses: 'actor actor-2', visible: actorFieldIsVisible,
                        help: t('filter.field.actor_diocese.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_principality.label'), {
                        model: 'actor_place_principality_name_2',
                        styleClasses: 'actor actor-2', visible: actorFieldIsVisible,
                        help: t('filter.field.actor_principality.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_order.label'), {
                        model: 'actor_order_name_2',
                        styleClasses: 'actor actor-2 !mbottom-default', visible: actorFieldIsVisible,
                        help: t('filter.field.actor_order.help'),
                    }),

                    {
                        type: 'label',
                        label: t('filter.field.actor.label', {index: 3}),
                        model: 'actor_3',
                        styleClasses: 'actor actor-3',
                        visible: actorFieldIsVisible
                    },
                    FormGeneratorFieldCreator.createMultiSelect(
                        t('filter.field.actor_name.label'),
                        {
                            model: 'actor_name_full_name_3',
                            styleClasses: 'actor actor-3',
                            visible: actorFieldIsVisible,
                            label: t('filter.field.actor_name.label'),
                            help: t('filter.field.actor_name.help'),
                        },
                        {onSearch: onAutocomplete('actor_name_full_name_3'), internalSearch: false}
                    ),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_role.label'), {
                        model: 'actor_role_3', styleClasses: 'actor actor-3', visible: actorFieldIsVisible,
                        label: t('filter.field.actor_role.label'),
                        help: t('filter.field.actor_role.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_function.label'), {
                        model: 'actor_capacity_3',
                        styleClasses: 'actor actor-3', visible: actorFieldIsVisible,
                        label: t('filter.field.actor_function.label'),
                        help: t('filter.field.actor_function.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_institution.label'), {
                        model: 'actor_place_name_3',
                        styleClasses: 'actor actor-3', visible: actorFieldIsVisible,
                        label: t('filter.field.actor_institution.label'),
                        help: t('filter.field.actor_institution.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_diocese.label'), {
                        model: 'actor_place_diocese_name_3',
                        styleClasses: 'actor actor-3', visible: actorFieldIsVisible,
                        label: t('filter.field.actor_diocese.label'),
                        help: t('filter.field.actor_diocese.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_principality.label'), {
                        model: 'actor_place_principality_name_3',
                        styleClasses: 'actor actor-3', visible: actorFieldIsVisible,
                        label: t('filter.field.actor_principality.label'),
                        help: t('filter.field.actor_principality.help'),
                    }),
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.actor_order.label'), {
                        model: 'actor_order_name_3',
                        styleClasses: 'actor actor-3 !mbottom-default', visible: actorFieldIsVisible,
                        label: t('filter.field.actor_order.label'),
                        help: t('filter.field.actor_order.help'),
                    }),

                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t('filter.legend.datation'),
                fields: [
                    {
                        type: 'DMYRange',
                        model: 'dating_scholary',
                        label: t('filter.field.date_scholarly_any.label'),
                        help: t('filter.field.date_scholarly_any.help'),

                        labelClasses: 'form-label',
                        validateDebounceTime: 1000,
                    },
                    {
                        type: 'checkboxBS5',
                        model: 'dating_scholary_preferential',
                        label: t('filter.field.date_scholarly_preferential.label'),
                        help: t('filter.field.date_scholarly_preferential.help'),

                        labelClasses: 'd-none',
                        default: true,
                    },
                    {
                        type: 'DMYRange',
                        model: 'dating_charter',
                        label: t('filter.field.date_unconverted.label'),
                        help: t('filter.field.date_unconverted.help'),
                        labelClasses: 'form-label',
                        validateDebounceTime: 1000,
                    },
                    FormGeneratorFieldCreator.createMultiSelect(t('filter.field.place_date.label'), {
                        model: 'charter_place_name',
                        help: t('filter.field.place_date.help'),
                    }),
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t('filter.legend.analysis'),
                fields: [
                    {
                        type: 'input',
                        inputType: 'text',
                        model: 'summary',
                        label: t('filter.field.summary.label'),
                        help: t('filter.field.summary.help'),
                        placeholder: 'Search in summary',
                        labelClasses: 'form-label',
                        validateDebounceTime: 1000,
                    },
                    {
                        type: 'input',
                        inputType: 'text',
                        model: 'fulltext',
                        label: t('filter.field.fulltext.label'),
                        help: t('filter.field.fulltext.help'),
                        placeholder: 'Search in charter',
                        labelClasses: 'form-label',
                        validateDebounceTime: 1000,
                    },
                ]
            },
            {
                styleClasses: 'collapsible collapsed',
                legend: t('filter.legend.images'),
                fields: [
                    {
                        label: t('filter.field.images.label'),
                        help: t('filter.field.images.help'),
                        type: 'checkboxBS5',
                        model: 'has_images',
                        labelClasses: 'd-none',
                    },
                ]
            },
        ],
    }
}