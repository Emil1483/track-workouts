export function combine<U>(array1: U[], array2: U[], predicate?: (obj1: U, obj2: U) => boolean): U[] {
    const result = Array.from(array1);
    array2.forEach(element => {
        if (!elementExists(result, element, predicate)) {
            result.push(element);
        }
    });
    return result;
}

export function elementExists<U>(array: U[], element: U, equal?: (obj1: U, obj2: U) => boolean): boolean {
    for (const elementInArray of array) {
        if (equal != null
            ? equal(elementInArray, element)
            : elementInArray == element
        ) {
            return true;
        }
    }
    return false;
}