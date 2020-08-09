const search = document.getElementById("search");
const matchList = document.getElementById("match-list");

search.addEventListener('input', function() {
  if (search.value != "") {
    getAutosuggestions(search.value);
  }
});

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
      json.predictions.forEach(function(prediction) {
        console.log("Prediction: " + prediction);
      });
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
      console.log(suggestionsHtml);
      matchList.innerHtml = suggestionsHtml;
      // return json;
    })
    .catch(err => console.error(err));
}
