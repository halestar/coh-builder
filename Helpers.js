/**
 * Simple function that returns the index that name can be found in arr (-1 if not found). name is compared by the
 * property array[i].name
 */

export function indexOfByName(arr, name)
{
    for(var i = 0; i < arr.length; i++)
    {
        if(arr[i].name === name)
            return i;
    }
    return -1;
}

export function getByLevel(arr, level)
{
    for(var i = 0; i < arr.length; i++)
    {
        if(arr[i].level === level)
            return arr[i];
    }
    return null;
}

export function logObj(obj)
{
    console.log(JSON.stringify(obj, null, 2));
}

export function nameCmp(a, b)
{
    return a.name.localeCompare(b.name);
}
