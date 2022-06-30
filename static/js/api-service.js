let apiService = (function () {
  function send(method, url, data) {
    const config = {
      method: method,
    };
    if (!["GET", "DELETE"].includes(method)) {
      config.headers = {
        "Content-Type": "application/json",
      };
      config.body = JSON.stringify(data);
    }
    return fetch(url, config).then((res) => res.json());
  }

  let module = {};
  function sendforauthentication(method, url, data, callback) {
    const config = {
      method: method,
    };
    if (!["GET", "DELETE"].includes(method)) {
      config.headers = {
        "Content-Type": "application/json",
      };
      config.body = JSON.stringify(data);
    }
    fetch(url, config)
      .then((res) => res.json())
      .then((val) => callback(null, val));
  }

  /*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date
  */

  module.getUsername = function () {
    return document.cookie.replace(
      /(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
  };

  module.signin = function (username, password, callback) {
    sendforauthentication("POST", "/signin/", { username, password }, callback);
    // return send(("POST", "/signin/", { username, password }));
    // return fetch("/signin/", {
    //   method: "POST",
    //   username,
    //   password,
    // }).then((res) => res.json());
  };

  module.signup = function (username, password, callback) {
    // console.log("username:" + username);
    // console.log("pass:" + password);
    // return send("POST", "/signup/", { username: username, password: password });
    sendforauthentication(
      "POST",
      "/signup/",
      { username: username, password: password },
      callback
    );
  };

  module.addImage = function (title, author, imageFile) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("date", new Date().toDateString());
    formData.append("picture", imageFile);
    return fetch("/api/images/", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());

    // return imageId;
  };

  module.deleteImage = function (imageId) {
    return send("DELETE", "/api/images/" + imageId + "/", {});
  };

  module.addComment = function (imageId, author, content) {
    let d = new Date();
    let comment = {
      imageId: imageId,
      author: author,
      content: content,
      date: d.toDateString(),
    };
    return send("POST", "/api/comments/", comment);
  };
  module.deleteComment = function (commentId) {
    return send("DELETE", "/api/comments/" + commentId + "/", {});
  };

  module.getComments = function (imageId, pageId = 0) {
    return send("GET", "/api/comments/" + imageId + "/", {
      imageId: imageId,
    }).then((res) => {
      if (pageId < 0) return null;
      let imageComments = res;
      let cleanedUpComments = imageComments.splice(pageId * 10, 10);
      if (cleanedUpComments.length === 0) return null;
      return cleanedUpComments;
    });
  };

  module.getGalleries = function (pageId = 0) {
    return send("GET", "/api/galleries/", {}).then((galleries) => {
      if (pageId < 0) return null;

      if (!galleries) return null;

      let cleanedUpGalleries = galleries.splice(pageId * 5, 5);
      if (cleanedUpGalleries.length === 0) return null;
      return cleanedUpGalleries;
    });
  };

  module.getImage = function (cur_gallery, imageId = -2) {
    return send("GET", "/api/images1/" + imageId + "/" + cur_gallery + "/", {
      imageId: imageId,
    }).then((image) => {
      if (!image) return null;
      return image;
    });
  };

  module.getNextImage = (cur_gallery, imageId) => {
    return send(
      "GET",
      "/api/images1/" + "next/" + imageId + "/" + cur_gallery + "/"
    ).then((image) => {
      if (image === null) return null;
      else return image;
    });
  };

  module.getPreviousImage = (cur_gallery, imageId) => {
    return send(
      "GET",
      "/api/images1/" + "previous/" + imageId + "/" + cur_gallery + "/"
    ).then((image) => {
      if (image === null) return null;
      else return image;
    });
  };

  return module;
})();
