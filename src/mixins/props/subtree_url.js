import {isNotBlank} from "../FoxValidators";

export default {
    props: {
        subtree_url: {
            type: String,
            default: null,
            validator: isNotBlank()
        }
    }
}
