import Articles from 'articles'


export default {
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
    },
    methods: {
        getFieldConfig(model) {
            return this.fields[model] ?? null;
        },
        updateFieldValues(data, fieldNames = null, keepModelData = false) {
            fieldNames = fieldNames && Array.isArray(fieldNames) ? fieldNames : Object.keys(this.fields)
            for (let fieldName of fieldNames) {
                const fieldConfig = this.getFieldConfig(fieldName);
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
                    fieldConfig.values = fieldConfig?.sortBy === 'name' ? values.sort(this._sortByName) : values

                    // active values? update model
                    let activeValues = fieldConfig.values.filter(item => item?.active)
                    if (activeValues.length) {
                        this.model[fieldName] = activeValues
                        // this.$set(this.model, fieldName, activeValues)
                    }
                    // update dependency field?
                    if (fieldConfig?.dependency && this.model[fieldConfig.dependency] == null) {
                        this._dependencyField(fieldConfig)
                    } else {
                        this._enableField(fieldConfig)
                    }
                }
            }
        },
        _disableField(field, model = null) {
            if (model == null) {
                model = this.model
            }
            field.disabled = true
            field.placeholder = 'Loading'
            field.selectOptions.loading = true
            field.values = []
        },
        _dependencyField(field, model = null) {
            if (model == null) {
                model = this.model
            }

            if ( ! (field.dependencyName ?? this.getFieldConfig(field.dependency) ) ) {
                console.error('VFG config error: dependency field not found for field ' + field.model)
                return
            }

            // get everything after last '.'
            let modelName = field.model.split('.').pop()

            let label = field.dependencyName ?? this.getFieldConfig(field.dependency).label.toLowerCase()

            delete model[modelName]
            field.disabled = true
            field.selectOptions.loading = false
            field.placeholder = 'Please select ' + Articles.articlize(label) + ' first'
            // set dependency state
            field.styleClasses = [...new Set(field?.styleClasses?.split(' ') ?? []).add('field--dependency-missing')].join(' ')
        },
        _enableField(field, model = null, search = false) {
            if (model == null) {
                model = this.model
            }
            if (field.values.length === 0) {
                return this._noValuesField(field, model, search)
            }

            // get everything after last '.'
            let modelName = field.model.split('.').pop()

            // only keep current value(s) if it is in the list of possible values
            // if (model[modelName] != null) {
            //     if (Array.isArray(model[modelName])) {
            //         let newValues = []
            //         for (let index of model[modelName].keys()) {
            //             if ((field.values.filter(v => v.id === model[modelName][index].id)).length !== 0) {
            //                 newValues.push(model[modelName][index])
            //             }
            //         }
            //         model[modelName] = newValues
            //     }
            //     else if ((field.values.filter(v => v.id === model[modelName].id)).length === 0) {
            //         model[modelName] = null
            //     }
            // }

            field.selectOptions.loading = false
            field.disabled = field.originalDisabled == null ? false : field.originalDisabled;
            let label = field.label.toLowerCase()
            field.placeholder = 'Select ' + Articles.articlize(label)

            // remove dependency state
            let classes = new Set(field?.styleClasses?.split(' ') ?? [])
            classes.delete('field--dependency-missing')
            field.styleClasses = [... classes].join(' ')
        },
        _noValuesField(field, model = null, search = false) {
            if (model == null) {
                model = this.model
            }

            // Delete value if not on the search page
            if (!search) {
                // get everything after last '.'
                let modelName = field.model.split('.').pop()
                delete model[modelName]
            }

            field.disabled = true
            field.selectOptions.loading = false
            field.placeholder = 'No ' + field.label.toLowerCase() + ' available'
        },
        _sortByName(a, b) {
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
    }
}
