const search = document.getElementById("search");
const matchList = document.getElementById("match-list");

search.addEventListener('input', function() {
  if (search.value != "") {
    getAutosuggestions(search.value);
  }
});


// function manipulateDom(html) {
//   console.log("Entered manipulateDom");
//   console.log("html = " + html);
//   document.getElementById("match-list").innerHTML = html;
// }

function manipulateDom(json) {
  console.log("Entered manipulateDom");
  console.log("json = " + json);
  let matchListDiv = document.getElementById("match-list");

  json.forEach(function(prediction) {
    console.log("Entered loop for " + prediction.location + " prediction");
    let resultDiv = document.createElement("DIV");
    resultDiv.className = "autocomplete-result";
    resultDiv.innerHTML = "" + prediction.location +
      "<input type='hidden' value='" + prediction.placeId +
      "' name='placeId' id='autocomplete-result-input' class='text-center'>";
    matchListDiv.appendChild(resultDiv);
  });
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

      // Build HTML string
      // let suggestionsHtml = "";
      // const predictionsArr = json.predictions;
      // predictionsArr.forEach(function(prediction) {
      //   console.log("Entered loop for " + prediction.location + " prediction");
      //   suggestionsHtml = suggestionsHtml +
      //
      //   '<form action="/selected" method="post">' +
      //     '<button value="' +
      //     prediction.placeId +
      //     '" name="placeId" class="card form-control text-center">' +
      //       prediction.location +
      //     '</button>' +
      //   '</form>'
      // });
      // manipulateDom(suggestionsHtml);

      const predictionsArr = json.predictions;
      manipulateDom(predictionsArr);

    })
    .catch(err => console.error(err));
}
