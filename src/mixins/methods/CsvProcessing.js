export default {
    methods: {
        downloadCsv: function ()
        {
            let data = this.getCsvHeaders();
            data += this.formatDataAsString(this.displayed_tree);
            this.initiateCsvDownload(data)
        },

        /**
         * Gathers the column headers for the CSV
         * @returns String
         */
        getCsvHeaders: function ()
        {
            let fields;
            let headers = [
                'ID'
            ];

            headers = headers.concat(this.csv_details_fields);
            headers.push('Parent');

            if (this.is_grouped === true) {
                fields = this.groups;
            } else {
                fields = this.columns;
            }
            
            for (let index in fields) {
                headers.push(fields[index].name);
            }
            
            this.encapsulateStrings(headers);
            return headers.join(',') + '\n';
        },
        
        /**
         * Compacts the given array into a single CSV string
         * @param data Array
         * @returns String
         */
        formatDataAsString: function (data)
        {
            let string = '';

            for (let index in data) {
                string += this.formatItemAsString(data[index]) + '\n';
            }
            
            return string;
        },

        /**
         * Compacts the given item into a comma delimited string
         * @param item Object
         * @returns String
         */
        formatItemAsString: function (item)
        {
            let data;
            let fields;
            let output = [
                item.id
            ];
            
            output = output.concat(item.details);
            
            if (typeof item.parent === 'object') {
                output.push(item.parent.id);                
            } else {
                output.push('');
            }
            
            if (this.is_grouped === true) {
                fields = this.groups;
            } else {
                fields = this.columns;
            }
            
            if (this.is_percented === true) {
                if (this.is_grouped === true) {
                    data = item.percentages.groups;
                } else {
                    data = item.percentages.values;
                }
            } else {
                if (this.is_grouped === true) {
                    data = item.groups;
                } else {
                    data = item.values;
                }
            }
            
            for (let index in fields) {
                output.push(data[fields[index].field]);
            }
            
            this.encapsulateStrings(output);
            return output.join(',');
        },

        /**
         * Starts the CSV download
         * @param data String The compiled CSV data
         */
        initiateCsvDownload: function (data)
        {
            let date = new Date();
            let filename = this.csv_filename + '_' 
                + date.getUTCFullYear() + '-' 
                + date.getUTCMonth() + '-' 
                + date.getUTCDay() + '_'
                + date.getUTCHours() + '-' 
                + date.getUTCMinutes() + '-' 
                + date.getUTCSeconds()
                + '.csv';
            let element = document.createElement('a');
            
            element.href='data:text/csv;charset=utf-8,' + encodeURI(data);
            element.target = '_blank';
            element.download = filename;
            element.click();
        },

        /**
         * Encapsulate strings with quotation marks
         * @param strings Array An array of values
         */
        encapsulateStrings: function (strings)
        {
            for (let index in strings) {
                if (typeof strings[index] === 'string') {
                    strings[index] = '"' + strings[index] + '"';
                }
            }
        }
    }
}
