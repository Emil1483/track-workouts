export function combine<U>(array1: U[], array2: U[], predicate?: (obj1: U, obj2: U) => boolean): U[] {
    const result = Array.from(array1);
    array2.forEach(element => {
        const shouldNotPush = predicate != null
            ? elementExists(result, element, predicate)
            : result.indexOf(element) != -1;

        if (!shouldNotPush) {
            result.push(element);
        }
    });
    return result;
}

export function elementExists<U>(array: U[], element: U, equal: (obj1: U, obj2: U) => boolean): boolean {
    for (const elementInArray of array) {
        if (equal(elementInArray, element)) return true;
    }
    return false;
}