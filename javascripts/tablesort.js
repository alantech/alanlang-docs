Tablesort.extend('alansort', () => true, (a, b) => {
  let aInt = parseInt(a);
  let bInt = parseInt(b);
  if (isNaN(aInt) || isNaN(bInt)) {
    return a > b ? 1 : -1;
  } else {
    return a - b;
  }
})
document$.subscribe(function() {
  let ths = document.querySelectorAll("article table:not([class]) th");
  for (let th of ths) {
    th.setAttribute('data-sort-method', 'alansort');
  }
  let tables = document.querySelectorAll("article table:not([class])");
  for (let table of tables) {
    new Tablesort(table);
  }
})
