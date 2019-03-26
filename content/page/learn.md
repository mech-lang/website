---
title: Learn
menu: main
comments: false
weight: 2
layout: page
---

# Documentation

Some brief documentation to start out with.

## Tables

Create a singleton table
```
  #value = 1
  #name = "Alan Turing"
```

Create an array
```
  #vector = [1 2 3]
```

Create a column array
```
  #column = [1; 2; 3]
```

Create a 2D table
```
  #two-by-three = [1 2 3
                   4 5 6]
```

Create a table with named columns
```
  #with-columns = [|name   age height|
                    "Yan"  20  100
                    "Seth" 23  102]
```

Create an inline table
```
  #inline-table = [name: "Yan" age: 20 height: 100]
```

Create a nested table
```
  #nested-table = [type: "div" parameters: [width: 100 height: 50]]
```

## Slicing Tables

Tables are 1-indexed, meaning the first element of the table is at index 1 (not 0 as in C-like languages)

Tables are indexed with the index operator {}. For example, we can get the 3rd element of a vector:
```
  #slice1 = #vector{3}
```

Get the 2nd row, 3rd column:
```
  #slice2 = #two-by-three{2,3}
```

Grab every row or column with the : operator
```
  #slice3 = #two-by-three{:,3}
```

Slice a range of columns
```
  #slice4 = #two-by-three{1,2:3}
```

Access a named column
```
  #slice5 = #with-columns.height
```

Or a specific row of a column
```
  #slice6 = #with-columns.height{2}
```

But you can still use indexes on tables with named columns
```
  #slice7 = #with-columns{2,3}
```

Access the value of a nested table by chaining {} operators
```
  #slice8 = #nested-table{2}{1}
```

## Math

Mech identifiers can contain - and / characters, which math operators, aside from negation must have spaces around them.

Math with scalars
```
  #result1 = 1 + 2
```

Math with negation
```
  #result1 = 1 + -(7 + 2)
```

Math with scalar and vector
```
  x = [1 2 3]
  #result2 = x + 1
```

Math with vectors. The operator is applied element-wise
```
  x = [1 2 3]
  y = [4 5 6]
  #result3 = x + y
```

Element-wise operations apply to 2d tables as well
```
  x = [1 2 3
       4 5 6]
  y = [7 8 9
       6 5 4]
  #result4 = x + y
```

Functions use named arguments. The same function can have different arguments depending on the input
```
  #result5 = math/sin(degrees: 90)
  #result6 = math/sin(radians: 90 * 3.14 / 180)
```

The input to a function can be a column. Regular functions operate element-wise on columns, and result in a column
```
  x = [30; 60; 90; 180; 240; 360]
  #result7 = math/sin(degrees: x)
```

Aggregates operate on a column, but the result is a single cell
```
  x = [30; 60; 90; 180; 240; 360]
  #result8 = stat/sum(column: x)
```