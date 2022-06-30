(function () {
  "use strict";

  window.addEventListener("load", function () {
    function onError(err) {
      console.error("[error]", err);
      let error_box = document.querySelector("#error_box");
      error_box.innerHTML = err;
      error_box.style.visibility = "visible";
    }

    function submit() {
      if (document.querySelector("#login-form").checkValidity()) {
        const username = document.querySelector(
          "#login-form [name=username]"
        ).value;
        const password = document.querySelector(
          "#login-form [name=password]"
        ).value;
        const action = document.querySelector(
          "#login-form [name=action]"
        ).value;
        apiService[action](username, password, function (err, username) {
          if (err) return onError(err);
          window.location.href = "/";
        });

        // apiService[action](username, password).then((username) => {
        //   if (err) return onError(err);
        //   window.location.href = "/";
        // });
      }
    }

    document.querySelector("#signin").addEventListener("click", function (e) {
      document.querySelector("form [name=action]").value = "signin";
      submit();
    });

    document.querySelector("#signup").addEventListener("click", function (e) {
      document.querySelector("form [name=action]").value = "signup";
      submit();
    });

    document.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
    });
  });
})();
