import {objectsHaveKeys} from "../FoxValidators";

export default {
    props: {
        groups: {
            type: Array,
            default: function () { return []; },
            validator: objectsHaveKeys([
                'name',
                'icon',
                'fields'
            ])
        }
    }
}
