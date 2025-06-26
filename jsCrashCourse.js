// Arrays

const arr1 = [1, 2, 3, 4, 5];

arr1.push(5);

console.log("arr1", arr1); 

console.log("Hello World")

arr1.forEach((value, index) => {
    console.log("value", value);
    arr1[index] = value + 1;
})

console.log("arr1", arr1);

// denser array

console.log([1, 2, 3].length)

// sparse array
const sparseArray = [1, , 2, , 5];
console.log(sparseArray.length,(sparseArray.filter((value)=> value != undefined )).length)



// Array as Stack

const pushedData = arr1.push(10);
pushedData
arr1
const removedData = arr1.pop();
removedData
arr1

// Reversing a string using Stack

const originalString = 'Manoj Kumar Chauhan';
const reversalStack = [];

console.log(originalString)

originalString.split('').forEach((char) => {
    reversalStack.push(char);
})

reversalStack


// for (let i = 0; i < reversalStack.length; i++){
//     reveredString += reversalStack.pop()
// }

// reveredString

// console.log(reveredString);

const reversedString = reversalStack.reverse().join('');

reversedString


function reverString() {
    let stack = [];

    for (let i = 0; i < originalString.length; i++){
        stack.push(originalString[i]);
    }

    let reversedString = '';

    while (stack.length > 0) {
        reversedString += stack.pop();
    }

    return reversedString;
}

console.log(reverString())

// Queue Data Structure;

const queueData = [1,2];

queueData.push(3); // add data at last / enqueue
queueData
queueData.shift(); // remove data at front / dequeue
queueData

function Queue() {
    this.elements = [];

    this.enqueue = (ele) => {
        this.elements.push(ele);
        // this.elements;
        // console.log(this.elements)
    }
    
    this.dequeue = () => {
        this.elements.shift();
        console.log(this.elements)
    }

}

const newQueueObj = new Queue();

newQueueObj.enqueue(1);

Array(2,3,4,5).map((value) => {
    newQueueObj.enqueue(value);
})

console.log(newQueueObj.elements);


// Splice

const splicedArray = [1, 2, 3, 4, 5];

console.log(splicedArray.slice(0,3))
splicedArray
console.log(splicedArray.splice(0, 3,))
splicedArray



console.log(splicedArray.indexOf(4, -4))

const checkArray = [1, 2, 3, 4];
const modifiebleArray = [1, 2, 3, 4, 5];

const result = checkArray.every((value, index, checkArray) => { // every elements should satisfy the condition
    // if(checkArray.length < 10) throw new Error("The Should not Be empty for while checking in every()")
    modifiebleArray[index] = value;
    checkArray[index] = value * 2;
    checkArray
    return value > 0 // Condition
})

checkArray

checkArray.forEach((value, index, array) => {
    array
    checkArray[index] = value * 3;
})


const result1 = checkArray.some((value) => { // at least one element satistfy the condition
    return value > 2; // condition
})

checkArray
modifiebleArray
result1
result

// Sorting

const sortingArray = [1, 2, 3, 4, 5, 10, 4, 5, 6, 44, 0, 20, 14];

console.log(sortingArray.sort())
console.log(sortingArray.sort((a, b) => {
    console.log(a, b);
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}))


// ''.localeCompare(); for non ascii characters

let employees = [{ name: "John", salary: 90000, hireDate: 'July 1, 2020' },
    {name: 'Ana', salary: 80000, hireDate: 'April 1, 2024'},
    { name: 'David', salary: 75000, hireDate: 'June 4, 2022' },
]

console.log(employees.sort(
    (a, b) => {
        console.log(a, b);

        // return a.salary - b.salary;
        // a.name = a.name.toUpperCase(); for case Insesitive sort.
        // b.name = b.name.toUpperCase();
        // if (a.name > b.name) return 1;
        // if (a.name < b.name) return -1;
        // return 0;
        
        let tempA = new Date(a.hireDate);
        tempA
        let tempB = new Date(b.hireDate);
        tempB
        return tempA - tempB;

    }
))

employees


// reduce

let numbers = [1, 2, 3, 4, 5];

let sum = numbers.reduce((accumulator, current) => {
    return accumulator + current;
})

sum