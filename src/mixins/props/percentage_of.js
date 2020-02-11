import {isNotBlank} from "../FoxValidators";

export default {
    props: {
        percentage_of: {
            type: String,
            default: null,
            validator: isNotBlank()
        }
    }
}
