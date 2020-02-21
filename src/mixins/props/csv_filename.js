import {isNotBlank} from "../FoxValidators";

export default {
    props: {
        csv_filename: {
            type: String,
            default: 'nested-tree',
            validator: isNotBlank()
        }
    }
}
