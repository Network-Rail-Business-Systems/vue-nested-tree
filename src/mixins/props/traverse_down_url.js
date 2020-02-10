import {isNotBlank} from "../FoxValidators";

export default {
    props: {
        traverse_down_url: {
            type: String,
            default: null,
            validator: isNotBlank()
        }
    }
}
