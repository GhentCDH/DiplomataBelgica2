import qs from 'qs'

import axios from 'axios'
import {toRaw} from "vue";

export default {
    props: {
        initUrls: {
            type: String,
            default: '{}',
        },
        title: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            urls: JSON.parse(this.initUrls),
            aggregation: null,
            data: null,
            model: {},
            schema: {},
            form: {
                options: {
                    validateAfterLoad: false,
                    validateAfterChanged: true,
                    validationErrorClass: "has-error",
                    validationSuccessClass: "success"
                },
                defaultModel: {},
                lastChangedFieldName: null,
            },
            searchClient: {
                openRequests: 0,
                abortController: null,
                prevFilterValues: {},
                debug: true,
            },
            // used to set timeout on free input fields
            // Remove requesting the same data that is already displayed
            searchParams: {},
        }
    },
    computed: {
        fields() {
            let res = {};
            if (this.schema && this.schema.fields) {
                this.schema.fields.forEach(field => {
                    if (!this.multiple || field.multi === true)
                        res[field.model] = field;
                });
            }
            if (this.schema && this.schema.groups) {
                this.schema.groups.forEach(group => {
                    if (group.fields) {
                        group.fields.forEach(field => {
                            if (!this.multiple || field.multi === true)
                                res[field.model] = field;
                        });
                    }
                });
            }
            return res;
        },
        showReset() {
            const convertEmptyToNull = (value) => {
                if (Array.isArray(value) && value.length === 0) {
                    return null;
                }
                if (typeof value === 'string' && value.trim() === '') {
                    return null;
                }
                return value;
            }
            for (const [key, value] of Object.entries(this.model)) {
                const cleanValue = convertEmptyToNull(value)
                const cleanDefaultValue = convertEmptyToNull(this.form.defaultModel[key] ?? null)
                if (JSON.stringify(cleanValue) !== JSON.stringify(cleanDefaultValue)) {
                    return true
                }
            }
            return false
        },
        querystring: function () {
            return qs.stringify({filters: this.searchClient.prevFilterValues});
        },
        tableData() {
            return this?.data?.data ?? []
        },
        totalRecords() {
            return this?.data?.count ?? 0
        },
    },
    methods: {
        /**
         * Constructs filter values based on the current model.
         * Iterates through the model and processes each field according to its type.
         * For 'multiselectClear' fields, it creates an array of IDs.
         *
         * @returns {Object} The constructed filter values.
         */
        constructFilterValues() {
            let result = {}
            if (this.model != null) {
                for (const [fieldName, fieldValue] of Object.entries(this.model)) {
                    const fieldType = this.fields[fieldName]?.type ?? null;
                    if (!fieldType || fieldValue == null) {
                        continue
                    }
                    switch (fieldType) {
                        case 'multiselectClear':
                            if (Array.isArray(this.model[fieldName])) {
                                var ids = []
                                for (let value of this.model[fieldName]) {
                                    ids.push(value['id'])
                                }
                                result[fieldName] = ids
                            } else {
                                result[fieldName] = this.model[fieldName]['id']
                            }
                            break;
                        default:
                            result[fieldName] = structuredClone(toRaw(this.model[fieldName]))
                            break;
                    }
                }
            }
            return result
        },
        sortByName(a, b) {
            const a_name = a.name.toString()
            const b_name = b.name.toString()

            // Place 'any', 'none' filters above
            if ((a_name === 'none' || a_name === 'any') && (b_name !== 'any' && b_name !== 'none')) {
                return -1
            }
            if ((a_name !== 'any' && a_name !== 'none') && (b_name === 'any' || b_name === 'none')) {
                return 1
            }

            // Place true before false
            if (a_name === 'false' && b_name === 'true') {
                return 1
            }
            if (a_name === 'true' && b_name === 'false') {
                return -1
            }

            // Default
            return a_name.localeCompare(b_name, 'en', {sensitivity: 'base'})
        },
        resetAllFilters() {
            this.searchClient.debug && console.log('resetallFilters')
            this.model = JSON.parse(JSON.stringify(this.form.defaultModel))
            this.searchClient.lastChangedFieldName = null
            this.onFormValidated(true)
        },
        onModelUpdated(value, fieldName) {
            this.searchClient.debug && console.log('onModelUpdated', value, fieldName)
            // console.trace();
            this.searchClient.lastChangedFieldName = fieldName
        },
        onFormValidated(isValid, errors) {
            this.searchClient.debug && console.log('onFormValidated', isValid, errors)

            // if not valid, do nothing
            if (!isValid) {
                return
            }

            // only send request if the filters have changed
            // filters are always in the same order, so we can compare serialization
            let filterValues = this.constructFilterValues()
            if (JSON.stringify(filterValues) === JSON.stringify(this.searchClient.prevFilterValues)) {
                return
            }

            // send request
            this.searchParams.page = 1 // reset page
            this.searchClient.prevFilterValues = JSON.parse(JSON.stringify(filterValues))
            this.requestData()
        },
        onData(data) {
        },
        onLoaded(data) {
            this.searchClient.debug && console.log('onLoaded', data)
            this.data = data

            // Update aggregation fields
            if (data?.aggregation) {
                this.aggregation = data.aggregation
                this.updateAggregations(this.aggregation);
            }

            this.searchClient.openRequests--

            // todo: fix Vue3 missing eventbus
            this.$emit('data', data)
        },
        updateAggregations(data, fieldNames = null, keepModelData = false) {
            fieldNames = fieldNames && Array.isArray(fieldNames) ? fieldNames : Object.keys(this.fields)
            for (let fieldName of fieldNames) {
                const fieldConfig = this?.fields?.[fieldName]
                if (fieldConfig && fieldConfig.type === 'multiselectClear') {
                    // get aggregation values
                    const values = data?.[fieldName] ?? [];

                    // add current model data?
                    if (keepModelData && this.model?.[fieldName]?.length) {
                        const ids = new Set(values.map(item => item.id))
                        for (const item of this.model?.[fieldName] ?? []) {
                            if (!ids.has(item.id)) {
                                values.push(item)
                            }
                        }
                    }

                    // sort values
                    // field.values = values.sort(this.sortByName)
                    fieldConfig.values = fieldConfig?.sortBy === 'name' ? values.sort(this.sortByName) : values

                    // active values? update model
                    let activeValues = fieldConfig.values.filter(item => item?.active)
                    if (activeValues.length) {
                        this.model[fieldName] = activeValues
                        // this.$set(this.model, fieldName, activeValues)
                    }
                    // update dependency field?
                    if (fieldConfig?.dependency && this.model[fieldConfig.dependency] == null) {
                        this.dependencyField(fieldConfig)
                    } else {
                        this.enableField(fieldConfig)
                    }
                }
            }
        },
        pushHistory(data) {
            // todo: why not push search state & model to history?
            this.searchClient.debug && console.log('push history', toRaw(data))
            history.pushState(data, document.title, document.location.href.split('?')[0] + '?' + qs.stringify(data))
        },
        onPopHistory(event) {
            this.searchClient.debug && console.log('pop history', event.target)
            this.model = {}
            this.initSearchParams()
            this.initModelFromQueryString();
            this.requestData(true, false).then((response) => {
            })
        },
        modelDataFromQueryString() {
            let query = qs.parse(window.location.href.split('?', 2)[1])
            return query['filters'] ?? {}
        },
        searchParamsFromQueryString() {
            let {orderBy, limit, ascending, page} = qs.parse(window.location.href.split('?', 2)[1])
            return {
                orderBy,
                ascending: parseInt(ascending) ? !!parseInt(ascending) : null,
                limit: parseInt(limit) || null,
                page: parseInt(page) || null,
            }
        },
        initSearchParams() {
            this.searchClient.debug && console.log('initSearchParams')
            const queryOptions = this.searchParamsFromQueryString()
            const searchParams = {
                orderBy: queryOptions.orderBy ?? this?.tableOptions?.orderBy?.column ?? null,
                ascending: queryOptions.ascending ?? this?.tableOptions?.orderBy?.ascending ?? true,
                limit: queryOptions.limit ?? this?.tableOptions?.pagination?.perPage ?? 25,
                page: queryOptions.page ?? this?.tableOptions?.pagination?.page ?? 1,
            }
            this.searchParams = searchParams
        },
        initModelFromQueryString(ignoreEmpty = false) {
            let params = qs.parse(window.location.href.split('?', 2)[1])
            const filters = params['filters'] ?? {}
            this.searchClient.debug && console.log('InitModelFromQueryString', params, ignoreEmpty)
            if (ignoreEmpty && Object.keys(filters).length === 0) {
                this.searchClient.debug && console.log('IgnoreEmpty', filters)
                return
            }
            // todo: copy needed?
            let model = JSON.parse(JSON.stringify(this.model))

            for (const [key, value] of Object.entries(filters)) {
                const fieldConfig = this.fields[key] ?? null;
                if (fieldConfig) {
                    switch (fieldConfig.type) {
                        case 'multiselectClear':
                            const ids = Array.isArray(value) ? value : [value]
                            model[key] = ids.map(id => ({
                                id: id,
                                name: '',
                                active: true,
                            }))
                            break;
                        case 'DMYRange':
                            model[key] = value
                            break
                        default:
                            if (value === 'true') {
                                model[key] = true
                                break;
                            }
                            if (value === 'false') {
                                model[key] = false
                                break;
                            }
                            model[key] = value
                            break;
                    }
                }
            }
            this.searchClient.debug && console.log('InitModelFromQueryString after', model)
            this.model = model
        },
        onTableSort(data) {
            this.searchParams['orderBy'] = data.sortBy
            this.searchParams['ascending'] = data.sortAscending
            // this.$set(this.searchParams, 'orderBy', data.sortBy)
            // this.$set(this.searchParams, 'ascending', data.sortAscending)
            this.requestData(false)
        },
        onTableLimit(limit) {
            this.searchParams['limit'] = limit
            // this.$set(this.searchParams, 'limit', limit)
            this.requestData(false)
        },
        onTablePagination(page) {
            this.searchParams['page'] = page
            // this.$set(this.searchParams, 'page', page)
            this.requestData(false)
        },
        requestData(aggregate = true, pushHistory = true) {
            this.searchClient.debug && console.log('requestData')
            // console.trace();

            // abort previous request
            if (this.searchClient.abortController) {
                this.searchClient.abortController.abort()
            }
            this.searchClient.abortController = new AbortController()

            // get table state
            let data = {}
            data = {...data, ...this.searchParams}

            // Add filter values if necessary
            data['filters'] = this.constructFilterValues()
            if (data['filters'] == null || data['filters'] == '') {
                delete data['filters']
            }

            // Add aggregation if necessary
            data['aggregate'] = aggregate

            // Send request
            this.searchClient.openRequests++
            return axios.get(this.requestUrl, {
                params: data,
                paramsSerializer: (params) => qs.stringify(params),
                signal: this.searchClient.abortController.signal,
            })
                .then((response) => {
                    if (pushHistory) {
                        this.pushHistory(data)
                    }
                    return response
                })
                .then((response) => {
                    this.onLoaded(response.data);
                    // this.$emit('loaded', response.data)
                    return response
                })
                .catch((error) => {
                    this.searchClient.openRequests--
                    if (axios.isCancel(error)) {
                        // abort message
                    } else {
                        console.log(error)
                        // this.dispatch('error', error)
                    }
                    // this.dispatch('error', error)
                })
                .finally(() => {
                    this.searchClient.abortController = null
                })
        },
        initSearchClient() {
            // store original model
            this.form.defaultModel = JSON.parse(JSON.stringify(this.model))
            // register onpopstate event
            window.onpopstate = ((event) => {
                this.onPopHistory(event)
            })
            // init model from querystring
            this.initSearchParams()
            this.initModelFromQueryString(true)
            // request data
            this.requestData(true, false)
        }
    },
    created() {
        this.initSearchClient();
    },

}
