<template>
    <tr class="subtree-row">
        <template v-for="depth in row_data.depth + 1">
            <tree-line :direction="row_data.lines[depth - 1]"></tree-line>
        </template>
        
        <td :colspan="details_span">
            <p
                v-for="(detail, index) in row_data.details"
                :key="index"
                :class="detailClasses(index)"
            >{{detail}}</p>
        </td>

        <template v-if="is_grouped === false">
            <td v-for="(column, index) in columns" :key="index">
                <template v-if="is_percented === true">
                    {{ row_data.percentages.values[column.field] }}
                </template><template v-else>
                    {{ row_data.values[column.field] }}
                </template>
                </td>
            </template><template v-else>
            <td v-for="(group, index) in groups" :key="index" class="has-text-centered">
                <template v-if="is_percented === true">
                    {{ row_data.percentages.groups[group.field] }}
                </template><template v-else>
                    {{ row_data.groups[group.field] }}
            </template>
            </td>
        </template>
    </tr>
</template>

<script>
    import TreeLine from "../TreeLine/TreeLine";
    import {objectHasKeys, objectsHaveKeys} from "../../mixins/FoxValidators";

    export default {
        name: 'subtree-row',
        components: {
            TreeLine
        },
        
        props: {
            row_data: {
                type: Object,
                required: true,
                validator: objectHasKeys([
                    'parent',

                    'id',
                    'details',
                    'values',
                    'groups',
                    'percentages',

                    'depth',
                    'lines'
                ])
            },
            columns: {
                type: Array,
                required: true,
                validator: objectsHaveKeys([
                    'name',
                    'icon'
                ])
            },
            groups: {
                type: Array,
                default: function () { return []; },
                validator: objectsHaveKeys([
                    'name',
                    'icon',
                    'fields'
                ])
            },
            tree_width: {
                type: Number,
                required: true
            },
            is_grouped: {
                type: Boolean,
                default: false
            },
            is_percented: {
                type: Boolean,
                default: false
            },
        },
        
        computed: {
            /**
             * How many columns the details may span
             * Tree width - subtree depth - controls compensation
             * @returns Number
             */
            details_span: function ()
            {
                return this.tree_width - this.row_data.depth - 1;
            }
        },

        methods: {
            detailClasses: function (index) {
                if (index === 0) {
                    return 'has-text-weight-bold';
                }

                return 'is-size-7 has-text-grey';
            }
        }
    }
</script>
