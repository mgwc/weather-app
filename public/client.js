const search = document.getElementById("search");
const matchList = document.getElementById("match-list");

search.addEventListener('input', function() {
  console.log("Input detected on search");
  requestAutosuggestions(search.value);
});

function requestAutosuggestions(query) {
  console.log(query);
  let queryObj = {userTyped: query};
  let queryObjStr = JSON.stringify(queryObj);
  fetch("http://localhost:3000/query/" + query, {
        method: 'POST',
        body: queryObjStr,
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
    .then(response => {
      // if (!response.ok) {
      //   throw new Error("Could not reach server.");
      // }
      if (response) {
        console.log(response);
      } else {
        console.log("Error");
      }
      return response.json();
    })
    .then(json => console.log(json))
    .catch(err => console.error(err));
}
