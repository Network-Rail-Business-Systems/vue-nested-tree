export default {
    methods: {
        uid: function ()
        {
            return Math.random().toString(36).substr(2, 5);
        }
    }
}
