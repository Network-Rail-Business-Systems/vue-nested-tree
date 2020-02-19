import {isNotBlank} from "../FoxValidators";

export default {
    props: {
        children_term: {
            type: String,
            default: 'Children',
            validator: isNotBlank()
        }
    }
}
