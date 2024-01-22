//called destructing
let person = { name: "John", age: 30, city: "New York" };

let { name: var1, age: var2, city: var3 } = person;
console.log(var1); // 'John'
console.log(var2); // 30
console.log(var3); // 'New York'

let person2 = { name2: "John", age2: 30, city2: "New York" };

let { name2, age2, city2 } = person;

console.log(name2); // 'John'
console.log(age2); // 30
console.log(city2); // 'New York'
