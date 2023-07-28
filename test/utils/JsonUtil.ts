
export class JsonUtil {
    static toObject() {
        return JSON.parse(JSON.stringify(this, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        ));
    }

    static toJson(data) {
        JSON.stringify(data, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        )
    }
}
