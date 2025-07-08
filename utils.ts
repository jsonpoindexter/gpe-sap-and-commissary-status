namespace Utils {

    export function isBoolString(value: string): boolean {
        return (
            value !== undefined &&
            value !== null &&
            (typeof value === 'string' || typeof value === 'boolean') &&
            (value.toString().toLowerCase() === 'true' || value.toString().toLowerCase() === 'false')
        )
    }
}
