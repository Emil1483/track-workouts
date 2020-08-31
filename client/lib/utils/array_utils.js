export function combine(array1, array2) {
    const result = Array.from(array1);
    array2.forEach(element => {
        const index = result.indexOf(element);
        if (index == -1) {
            result.push(element);
        }
    });
    return result;
}
