export default {
    methods: {
        prepareUrl: function (sourceUrl, nodeId, filterId)
        {
            let preparedUrl = sourceUrl.replace('%id', nodeId);
            
            if (filterId !== null) {
                preparedUrl = preparedUrl.replace('%filter', filterId);
            } else {
                preparedUrl = preparedUrl.replace('/%filter', '');
            }
            
            return preparedUrl;
        }
    }
}
