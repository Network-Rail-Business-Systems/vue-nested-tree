import {objectsHaveKeys} from "../FoxValidators";

export default {
    props: {
        columns: {
            type: Array,
            required: true,
            validator: objectsHaveKeys([
                'name',
                'icon'
            ])
        }
    }
}
