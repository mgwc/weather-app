const search = document.getElementById("search");
const matchList = document.getElementById("match-list");

search.addEventListener('input', function() {
  if (search.value != "") {
    getAutosuggestions(search.value);
  }
});


function manipulateDom(html) {
  console.log("Entered manipulateDom");
  console.log("html = " + html);
  console.log(document.getElementById("welcome-message").className);
  document.getElementById("welcome-message").innerHTML = "Hello";
  document.getElementById("match-list").innerHTML = html;
}

function getAutosuggestions(query) {
  let queryObj = {userTyped: query};
  let queryObjStr = JSON.stringify(queryObj);
  const predictionsObj = fetch("http://localhost:3000/query/" + query, {
        method: 'POST',
        body: queryObjStr,
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Could not reach server.");
      }
      return response.json();
    })
    .then(json => {

      // manipulateDom(html);

      // Build HTML string
      let suggestionsHtml = "";
      const predictionsArr = json.predictions;
      predictionsArr.forEach(function(prediction) {
        console.log("Entered loop for " + prediction + " prediction");
        suggestionsHtml = suggestionsHtml +
        '<div class="card">' +
        '<div class="card-body">' +
        prediction +
        '</div>' +
        '</div>'
      });
      manipulateDom(suggestionsHtml);
    })
    .catch(err => console.error(err));
}
