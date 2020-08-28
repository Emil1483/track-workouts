export function contains(array: any[], element: any): boolean {
    for (const i in array) {
        if (array[i] == element) return true;
    }
    return false;
}