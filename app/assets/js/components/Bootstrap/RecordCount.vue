<template>
  <div v-if="countRecords">{{ countRecords }}</div>
</template>

<script>
export default {
  name: 'RecordCount',
  props: {
    totalRecords: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      required: true
    },
    page: {
      type: Number,
      required: true
    },
    textTemplate: {
      type: String,
      default: 'Showing records {from} to {to} out of {count}'
    }
  },
  computed: {
    countRecords() {
      if (!this.totalRecords) {
        return '';
      }

      const from = ((this.page - 1) * this.perPage) + 1;
      const to = this.page === this.totalPages ? this.totalRecords : from + this.perPage - 1;

      return this.textTemplate
        .replace('{count}', this.totalRecords)
        .replace('{from}', from)
        .replace('{to}', to);
    },
    totalPages() {
      return Math.ceil(this.totalRecords / this.perPage);
    }
  }
};
</script>