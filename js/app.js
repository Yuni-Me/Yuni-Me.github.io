jQuery(document).ready(function ($) {
  //set some variables
  var isAnimating = false,
    firstLoad = false,
    newScaleValue = 1;

  //cache DOM elements
  var dashboard = $(".cd-side-navigation"),
    mainContent = $(".cd-main"),
    loadingBar = $("#cd-loading-bar");

  //select a new section
  dashboard.on("click", "a", function (event) {
    event.preventDefault();
    var target = $(this),
      //detect which section user has chosen
      sectionTarget = target.data("menu");
    if (!target.hasClass("selected") && !isAnimating) {
      //if user has selected a section different from the one alredy visible - load the new content
      triggerAnimation(sectionTarget, true);
    }
    firstLoad = true;
  });

  //detect the 'popstate' event - e.g. user clicking the back button
  $(window).on("popstate", function () {
    if (firstLoad) {
      /*
		    Safari emits a popstate event on page load - check if firstLoad is true before animating
		    if it's false - the page has just been loaded 
		    */
      var newPageArray = location.pathname.split("/"),
        //this is the url of the page to be loaded
        newPage = newPageArray[newPageArray.length - 1].replace(".html", "");
      if (!isAnimating) triggerAnimation(newPage, false);
    }
    firstLoad = true;
  });

  //scroll to content if user clicks the .cd-scroll icon
  mainContent.on("click", ".cd-scroll", function (event) {
    event.preventDefault();
    var scrollId = $(this.hash);
    $(scrollId).velocity("scroll", { container: $(".cd-section") }, 200);
  });

  //start animation
  function triggerAnimation(newSection, bool) {
    isAnimating = true;
    newSection = newSection == "" ? "index" : newSection;

    //update dashboard
    dashboard
      .find('*[data-menu="' + newSection + '"]')
      .addClass("selected")
      .parent("li")
      .siblings("li")
      .children(".selected")
      .removeClass("selected");
    //trigger loading bar animation
    initializeLoadingBar(newSection);
    //load new content
    loadNewContent(newSection, bool);
  }

  function initializeLoadingBar(section) {
    var selectedItem = dashboard.find(".selected"),
      barHeight = selectedItem.outerHeight(),
      barTop = selectedItem.offset().top,
      windowHeight = $(window).height(),
      maxOffset =
        barTop + barHeight / 2 > windowHeight / 2
          ? barTop
          : windowHeight - barTop - barHeight,
      scaleValue =
        ((2 * maxOffset + barHeight) / barHeight).toFixed(3) / 1 + 0.001;

    //place the loading bar next to the selected dashboard element
    loadingBar
      .data("scale", scaleValue)
      .css({
        height: barHeight,
        top: barTop,
      })
      .attr("class", "")
      .addClass("loading " + section);
  }

  function loadNewContent(newSection, bool) {
    setTimeout(function () {
      //animate loading bar
      loadingBarAnimation();

      //create a new section element and insert it into the DOM
      var section = $(
        '<section class="cd-section overflow-hidden ' +
          newSection +
          '"></section>'
      ).appendTo(mainContent);
      //load the new content from the proper html file
      section.load(newSection + ".html .cd-section > *", function (event) {
        //finish up the animation and then make the new section visible
        var scaleMax = loadingBar.data("scale");

        loadingBar.velocity("stop").velocity(
          {
            scaleY: scaleMax,
          },
          400,
          function () {
            //add the .visible class to the new section element -> it will cover the old one
            section
              .prev(".visible")
              .removeClass("visible")
              .end()
              .addClass("visible")
              .on(
                "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
                function () {
                  resetAfterAnimation(section);
                }
              );

            //if browser doesn't support transition
            if ($(".no-csstransitions").length > 0) {
              resetAfterAnimation(section);
            }

            var url = newSection + ".html";

            if (url != window.location && bool) {
              //add the new page to the window.history
              //if the new page was triggered by a 'popstate' event, don't add it
              window.history.pushState({ path: url }, "", url);
            }
          }
        );
      });
    }, 50);
  }

  function loadingBarAnimation() {
    var scaleMax = loadingBar.data("scale");
    if (newScaleValue + 1 < scaleMax) {
      newScaleValue = newScaleValue + 1;
    } else if (newScaleValue + 0.5 < scaleMax) {
      newScaleValue = newScaleValue + 0.5;
    }

    loadingBar.velocity(
      {
        scaleY: newScaleValue,
      },
      100,
      loadingBarAnimation
    );
  }

  function resetAfterAnimation(newSection) {
    //once the new section animation is over, remove the old section and make the new one scrollable
    newSection.removeClass("overflow-hidden").prev(".cd-section").remove();
    isAnimating = false;
    //reset your loading bar
    resetLoadingBar();
  }

  function resetLoadingBar() {
    loadingBar.removeClass("loading").velocity(
      {
        scaleY: 1,
      },
      1
    );
  }
});

// ========== //
//    Form    //
// ========== //
// -- Static Submission --//
// Code Courtesy of formspree.io. Altered to use Axios API instead of XML

// Get form element and submit status bar
const form = document.getElementById("my-form");
const status = document.getElementById("js-form-status");
// Point form submission to FormSpree if Javascript is enabled by user
if (form !== null) {
  form.setAttribute("action", "https://formspree.io/f/xzbkeowd");
  // Grab the input fields
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const message = document.getElementById("message");
  let inputGroup = [name, email, message];

  // Removed the required boolean if JavaScript is enabled by user to allow for custom validation
  inputGroup.forEach((input) => input.removeAttribute("required"));
  // Set variable to store validation for the form submission.
  let valid;
  form.addEventListener("focusout", (e) => {
    const target = e.target;

    // Grab .form-pair class where validation style classes will be added.
    const inputWrap = target.closest(".form-pair");

    // Make sure code does not fire when focused on the form buttons
    if (inputWrap) {
      // Set variable to add boolean return for validation checks.
      // This is looking for false validation.
      let notValid;

      // Check if target input is a normal text field
      if (target == name || target == message) {
        notValid = target.value === "";
      }

      // Check if target is an email field
      if (target == email) {
        mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Return the opposite boolean to match variable
        notValid = !mailRegex.test(email.value);
      }

      // If notValid checks return true...
      if (notValid) {
        // Show style indication for not valid input field
        classReplace(inputWrap, "isValid", "notValid");

        // Store false for form submission check and stop the event listener.
        valid = false;
        return;
      }

      // Show style indication for valid input field
      classReplace(inputWrap, "notValid", "isValid");

      // Store true for form submission check.
      valid = true;
    }
  });

  // handle the form submission event
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const data = new FormData(form);

    // Run submission if validation checks return true.
    if (valid) {
      formAjax(form.method, form.action, data, success, error);
    }
  });

  // Handle form rest
  form.addEventListener("reset", () => {
    // -- Remove validation stylings with the input values -- //
    // Grab all inputs that were checked for validation
    const inputs = [name, email, message];

    // Loop through this new array
    loopArrayCallback(inputs, (input) => {
      const inputParent = input.closest(".form-pair");
      // Remove validation classes should they exist
      inputParent.classList.remove("isValid");
      inputParent.classList.remove("notValid");
    });
    status.classList.remove("form-status--success");
  });
}

// function to loop through an array and pass in a callback to provide an output.
function loopArrayCallback(array, callback) {
  for (let i in array) {
    callback(array[i]);
  }
}
function classReplace(element, remove, add) {
  element.classList.remove(remove);
  element.classList.add(add);
}
// Success and Error functions for after the form is submitted
function success() {
  form.reset();
  status.classList.add("form-status--success");
  status.textContent = "Message Sent!";
}

function error(e) {
  status.classList.add("form-status--error");
  status.textContent = "Oops! There was a problem.";
  console.error(`There was a problem: ${e.message}.`);
}

function formAjax(method, url, data, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status === 200) {
      success(xhr.response, xhr.responseType);
    } else {
      error(xhr.status, xhr.response, xhr.responseType);
    }
  };
  xhr.send(data);
}
