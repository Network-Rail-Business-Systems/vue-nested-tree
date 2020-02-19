import {isNotBlank} from "../FoxValidators";

export default {
    props: {
        subtree_term: {
            type: String,
            default: 'Subtree',
            validator: isNotBlank()
        }
    }
}
