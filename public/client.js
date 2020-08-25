const search = document.getElementById("search");
let currentFocus = -1;
let inputTimeoutFunction;

search.addEventListener('input', function() {
  if (inputTimeoutFunction) {
    clearTimeout(inputTimeoutFunction);
  }

  if (search.value != "") {
    inputTimeoutFunction = setTimeout(getAutosuggestions, 200);
  }
});

search.addEventListener("keydown", function(e) {
    var x = document.getElementById("autocomplete-list");
    if (x) {
      x = x.getElementsByTagName("div");
    }

    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
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

// Add autocomplete items (whose data is provided by server) to DOM
function manipulateDom(json) {

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
      document.getElementById("locationBtn").value =
        this.getElementsByTagName("input")[0].value;
      /*close the list of autocompleted values,
      (or any other open lists of autocompleted values:*/
      document.getElementById("locationBtn").click();
      });
    autocompleteItems.appendChild(result);
  });

  // let googleAttribution = document.createElement("DIV");
  // googleAttribution.className = "d-flex flex-row-reverse";
  // googleAttribution.innerHTML =
  //   "<img src='/images/powered_by_google_on_non_white.png'" +
  //           "alt='Powered by Google logo'>";
  // document.getElementById("autocomplete").appendChild(googleAttribution);
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
      const predictionsArr = json.predictions;
      manipulateDom(predictionsArr);

    })
    .catch(err => console.error(err));
}
