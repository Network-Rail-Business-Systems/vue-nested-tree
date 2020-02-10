export default {
    methods: {
        /**
         * Turns an input tree node into a processed tree node with groups and percentages
         * @param sourceData Object The unprocessed data from the input tree
         * @param depth Number How deep the node is
         * @returns Object The processed tree node with added fields
         */
        createTreeNode: function (sourceData, depth)
        {
            let node = {
                type: 'tree',
                parent: null,

                id: sourceData.id,
                details: sourceData.details,
                values: sourceData.data,
                groups: null,
                percentages: null,

                children: {
                    available: sourceData.children === true,
                    expanded: depth === 0,
                    loaded: Array.isArray(sourceData.children) === true,
                    contents: []
                },

                subtree: {
                    available: typeof sourceData.subtree === 'undefined' || sourceData.subtree === true,
                    expanded: false,
                    loaded: Array.isArray(sourceData.subtree) === true,
                    contents: null
                },

                depth: depth,
                levels: 0,
                lines: []
            };

            node.groups = this.groupData(sourceData.data);
            node.percentages = this.percentData(sourceData.data, node.groups);
            node.subtree.contents = this.processSubtree(sourceData.subtree, node);

            return node;
        },
        
        /**
         * Creates a subtree row with percent and group data
         * @param subtreeRow Object The unprocessed subtree row data
         * @param parent Object The tree node this belongs to
         * @return Object The processed subtree row
         */
        createSubtreeRow: function (subtreeRow, parent)
        {
            let groups = this.groupData(subtreeRow.data);
            let percents = this.percentData(subtreeRow.data, groups);

            return {
                type: 'subtree',
                parent: parent,

                id: subtreeRow.id,
                details: subtreeRow.details,
                values: subtreeRow.data,
                groups: groups,
                percentages: percents,

                depth: parent.depth + 1,
                lines: []
            };
        },

        /**
         * Creates summed groups based on the groups settings
         * @param data Object The data to replicate
         * @return Object The grouped data
         */
        groupData: function (data)
        {
            let groupedData = {};

            if (this.grouping_is_enabled === false) {
                return groupedData;
            }

            for (let group in this.groups) {
                group = this.groups[group];
                groupedData[group.field] = 0;

                for (let index in group.fields) {
                    groupedData[group.field] += data[group.fields[index]];
                }
            }

            return groupedData;
        },

        /**
         * Creates percentages based on the column specified in percentage_of
         * @param ungroupedData Object The data to replicate
         * @param groupedData Object The grouped data to replicate
         * @return Object Percentage values in the same format as data
         */
        percentData: function (ungroupedData, groupedData)
        {
            let percents = {
                values: {},
                groups: {}
            };

            if (this.percenting_is_enabled === false) {
                return percents;
            }

            let total = ungroupedData[this.percentage_of];

            percents.values = this.percentValues(ungroupedData, this.columns, total);

            if (this.grouping_is_enabled === true) {
                percents.groups = this.percentValues(groupedData, this.groups, total);
            }

            return percents;
        },

        /**
         * Creates percentages for the given tree node data
         * @param data Object The tree node data
         * @param columns Array The columns to calculate against
         * @param total Number The total to create a percentage of
         * @return Object Percentages in the same format as the source data
         */
        percentValues: function (data, columns, total)
        {
            let values = {};
            let value;

            for (let column in columns) {
                column = columns[column];

                if (column.field === this.percentage_of) {
                    value = data[column.field];
                } else if (typeof column.percent !== 'undefined' && column.percent === false) {
                    value = data[column.field];
                } else {
                    value = data[column.field] / total;
                    value = value.toFixed(2) * 100 + '%';
                }

                values[column.field] = value;
            }

            return values;
        }
    }
}