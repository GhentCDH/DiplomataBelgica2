<template>
    <div>
        <div class="form-check padding-none">
            <input 
                class="form-check-input" 
                type="checkbox"
                :id="schema.label">
            <label class="form-check-label checkbox-label" :for="schema.label">
                {{ schema.label }}
            </label>
        </div>
    </div>
    
</template>

<script>
import { abstractField } from "vue-form-generator";

export default {
    mixins: [ abstractField ]
};
</script>