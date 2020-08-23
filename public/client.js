const search = document.getElementById("search");
let currentFocus = -1;
let inputTimeoutFunction;

search.addEventListener('input', function() {
  // closeAllLists();
  if (inputTimeoutFunction) {
    console.log("inputTimeoutFunction was set and is now unset");
    clearTimeout(inputTimeoutFunction);
  } else {
    console.log("inputTimeoutFunction was " + inputTimeoutFunction);
  }
  if (search.value != "") {
    inputTimeoutFunction = setTimeout(getAutosuggestions, 200);
    console.log("inputTimeoutFunction set; inputTimeoutFunction = " + inputTimeoutFunction);
  }
});

search.addEventListener("keydown", function(e) {
    console.log("Entered search.addEventListener(keydown)");
    var x = document.getElementById("autocomplete-list");
    if (x) {
      x = x.getElementsByTagName("div");
      console.log("x = " + x);
    } else {
      console.log("There is no x");
    }

    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      console.log("Down arrow was pressed");
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      console.log("Up arrow was pressed");
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      console.log("Enter key was pressed");
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) {
          console.log(x[currentFocus]);
          x[currentFocus].click();
        }
      }

    }
});

function addActive(x) {
  console.log("Entered addActive; x = " + x);
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = (x.length - 1);
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("autocomplete-active");
}

function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("autocomplete-active");
  }
}

function closeAllLists(elmnt) {
  /*close all autocomplete lists in the document,
  except the one passed as an argument:*/
  var x = document.getElementsByClassName("autocomplete-items");
  for (var i = 0; i < x.length; i++) {
    if (elmnt != x[i] && elmnt != search) {
    x[i].parentNode.removeChild(x[i]);
    }
  }
}

// function manipulateDom(html) {
//   console.log("Entered manipulateDom");
//   console.log("html = " + html);
//   document.getElementById("match-list").innerHTML = html;
// }

// Add autocomplete items (whose data is provided by server) to DOM
function manipulateDom(json) {
  console.log("Entered manipulateDom");
  console.log("json = " + json);
  let input = document.getElementById("search");

  let autocompleteItems = document.createElement("DIV");
  autocompleteItems.setAttribute("id", "autocomplete-list");
  autocompleteItems.setAttribute("class", "autocomplete-items");
  /*append the DIV element as a child of the autocomplete container:*/
  document.getElementById("autocomplete").appendChild(autocompleteItems);
  // let matchListDiv = document.getElementById("match-list");

  json.forEach(function(prediction) {
    console.log("Entered loop for " + prediction.location + " prediction");
    let result = document.createElement("DIV");
    result.className = "autocomplete-result";
    result.innerHTML = "" + prediction.location +
      "<input type='hidden' value='" + prediction.placeId +
      "' name='placeId' id='autocomplete-result-input' class='text-center'>";
    result.addEventListener("click", function(e) {
      /*insert the value for the autocomplete text field:*/
      search.value = this.textContent;
      let selectedLocation = this.getElementsByTagName("input")[0];
      document.getElementById("locationBtn").value = selectedLocation.value;
      /*close the list of autocompleted values,
      (or any other open lists of autocompleted values:*/
      // closeAllLists();
      document.getElementById("locationBtn").click();
      });
    autocompleteItems.appendChild(result);
    });
}

function getAutosuggestions() {
  closeAllLists();
  let query = search.value;
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
