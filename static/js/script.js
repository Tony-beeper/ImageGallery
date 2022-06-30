(async function () {
  "use strict";
  let commentForm = document.getElementById("create-comment-form");
  let imageForm = document.getElementById("add-image-form");

  let displayCommentForm = false;
  let displayImageForm = false;
  let imageLoaded = false;
  window.addEventListener("load", function () {
    let username = apiService.getUsername();
    let cur_gallery = username;
    const signInButton = document.getElementById("signin-button");
    const signOutButton = document.getElementById("signout-button");
    const imageBody = document.getElementById("image-body");
    const previousButton = document.getElementById("previous-btn");
    const nextButton = document.getElementById("next-btn");
    const commentsBody = document.getElementById("comments-body");
    const galleries = document.getElementById("galleries");
    const previousButtongalleries = document.getElementById(
      "previous-btn-galleries"
    );
    const nextButtongalleries = document.getElementById("next-btn-galleries");

    // const createMessageForm = document.querySelector("#create-message-form");
    signInButton.style.visibility = username ? "hidden" : "visible";
    signOutButton.style.visibility = username ? "visible" : "hidden";
    imageBody.style.visibility = username ? "visible" : "hidden";
    previousButton.style.visibility = username ? "visible" : "hidden";
    nextButton.style.visibility = username ? "visible" : "hidden";
    commentsBody.style.visibility = username ? "visible" : "hidden";
    galleries.style.visibility = username ? "visible" : "hidden";
    previousButtongalleries.style.visibility = username ? "visible" : "hidden";
    nextButtongalleries.style.visibility = username ? "visible" : "hidden";

    // createMessageForm.style.visibility = username ? "visible" : "hidden";
    // const setHeader()
    const loadwelcome = () => {
      if (username) {
        let header = this.document.getElementById("top-header");
        let element = this.document.createElement("div");
        element.innerHTML = `Welcome ${username}!`;
        header.prepend(element);
      }
    };
    loadwelcome();
    const loadgalleries = (pageId = 0) => {
      apiService.getGalleries(pageId).then((galleries) => {
        console.log(galleries);
        if (!galleries) return;
        let galleryList = this.document.getElementById("gallerylist");
        galleryList.innerHTML = "";
        galleries.forEach(function (gallery) {
          galleryList.prepend(createGallery(gallery));
        });
        createGalleryPageId(pageId);
      });
    };

    const createGallery = (gallery) => {
      let element = document.createElement("div");
      element.className = "gallery";
      element.innerHTML = `${gallery._id}`;

      element.addEventListener("click", function (e) {
        e.preventDefault();
        cur_gallery = gallery._id;
        loadimage(cur_gallery);

        // let image = document.getElementById("image-id");
        // if (image !== null) loadcomments(image.value);
      });

      return element;
    };

    function createGalleryPageId(pageId) {
      let element = document.createElement("textarea");
      element.className = "page-id";
      element.id = "gallery-page-id";
      element.innerHTML = `${pageId}`;

      document.getElementById("gallerylist").prepend(element);
    }
    loadgalleries();
    const loadcomments = (imageId, pageId = 0) => {
      apiService.getComments(imageId, pageId).then((comments) => {
        if (comments === null) {
          if (pageId !== 0) {
            //no comments after pressing next or previous button
            return false;
          } else {
            //no comments at all for this image
            document.querySelector("#comments").innerHTML = "";
            createPageId(pageId);
            return true;
          }
        }

        document.querySelector("#comments").innerHTML = "";
        comments.forEach(function (comment) {
          createNewcomment(comment);
        });
        createPageId(pageId);
        return true;
      });
    };

    function createPageId(pageId) {
      let element = document.createElement("textarea");
      element.className = "page-id";
      element.id = "page-id";
      element.innerHTML = `${pageId}`;
      document.querySelector("#comments").prepend(element);
    }

    function createNewcomment(comment) {
      let element = document.createElement("div");
      element.className = "comment";
      if (
        (username && comment.author === username) ||
        cur_gallery === username
      ) {
        element.innerHTML = `
        <div class="comment-user">
            <div class="heart-icon icon"></div>
            <div class="comment-username">${comment.author}</div>
        </div>
        <div class="comment-content">${comment.content}</div>
        <div class="comment-date">${comment.date}</div>
        <div class="delete-icon icon"></div>
      `;
        element
          .querySelector(".delete-icon")
          .addEventListener("click", function (e) {
            apiService.deleteComment(comment._id).then(() => {
              loadcomments(comment.imageId);
            }); //change commentId to id instead
            // await loadcomments(comment.imageId);
          });
      } else if (username) {
        element.innerHTML = `
          <div class="comment-user">
              <div class="heart-icon icon"></div>
              <div class="comment-username">${comment.author}</div>
          </div>
          <div class="comment-content">${comment.content}</div>
          <div class="comment-date">${comment.date}</div>
        `;
      } else {
        element.innerHTML = "";
      }

      document.querySelector("#comments").prepend(element);
    }

    const loadimage = (cur_gallery, imageId = -2) => {
      apiService.getImage(cur_gallery, imageId).then((image) => {
        if (image === null) {
          document.getElementById("image-frame").innerHTML = "";
          let element = document.createElement("div");

          element.innerHTML = `
            <img
            class="image-display"
            id="image-placeholder"
            src="media/noimage.jpeg"
            />
            <div class="image-text">${cur_gallery} has no images yet.</div>
          `;
          document.getElementById("image-frame").prepend(element);
          loadcomments();
          return;
        }

        if (imageLoaded === false) {
          imageLoaded = true;
          document.getElementById("image-frame").innerHTML = "";
          createNewImage(image);
        } else {
          document.getElementById("image-frame").innerHTML = "";
          createNewImage(image);
        }
        let img = document.getElementById("image-id");
        if (img !== null) loadcomments(img.value);
        else loadcomments();
      });
    };

    const createNewImage = (image) => {
      let element = document.createElement("div");
      element.className = "image-display";
      if (image.author === username) {
        element.innerHTML = `
        <img
          class="image-display"
          id="image-placeholder"
          src="/api/images/second/${image._id}/"
        />
        <div class="image-text">Author:${image.author}</div>
        <div class="image-text">Title:${image.title}</div>
        <textarea id="image-id" class="image-id">${image._id}</textarea> 
    `;
        let deleteIcon = document.createElement("div");
        deleteIcon.className = "delete-btn delete-btn-setting";
        deleteIcon.addEventListener("click", function (e) {
          e.preventDefault();
          let imageId = document.getElementById("image-id").value;
          // let next_img = await
          apiService.getNextImage(cur_gallery, imageId).then((next_img) => {
            apiService.deleteImage(imageId).then(() => {
              if (next_img) {
                loadimage(cur_gallery, next_img._id);
              } else {
                loadimage();
              }
              // let refreshedImage = document.getElementById("image-id");
              if (next_img._id !== imageId) {
                loadcomments(next_img._id);
              } else {
                loadcomments();
              }
            });
          });
        });
        document.getElementById("image-frame").append(deleteIcon);
      } else {
        element.innerHTML = `
          <img
            class="image-display"
            id="image-placeholder"
            src="/api/images/second/${image._id}/"
          />
          <div class="image-text">Author:${image.author}</div>
          <div class="image-text">Title:${image.title}</div>
          <textarea id="image-id" class="image-id">${image._id}</textarea> 
      `;
      }

      document.getElementById("image-frame").prepend(element);
      // document.getElementById("image-frame").append(deleteIcon);
    };

    function showHideImageForm() {
      if (displayImageForm) {
        imageForm.style.display = "none";
        displayImageForm = false;
      } else {
        imageForm.style.display = "flex";
        displayImageForm = true;
        if (displayCommentForm) showHideCommentForm();
      }
    }

    function showHideCommentForm() {
      if (displayCommentForm) {
        commentForm.style.display = "none";
        displayCommentForm = false;
      } else {
        commentForm.style.display = "flex";
        displayCommentForm = true;
        if (displayImageForm) showHideImageForm();
      }
    }
    document
      .getElementById("add-image-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        let image = document.getElementById("picture-field").files[0];
        // let author = document.getElementById("image-author-name").value;
        let title = document.getElementById("image-title").value;

        document.getElementById("add-image-form").reset();

        // let imageId = await
        apiService.addImage(title, username, image).then((imageId) => {
          if (imageId !== null) {
            cur_gallery = username;
            loadimage(username, imageId);
            cur_gallery = username;
            // document.getElementById("image-id").value
            loadcomments(imageId);
          } else {
            window.alert("Incorrect file type. Only image file type accepted.");
          }
        });
      });

    document
      .getElementById("create-comment-form")

      .addEventListener("submit", function (e) {
        let image = document.getElementById("image-id");

        if (image === null) {
          window.alert("no image yet, cannot comment");
          document.getElementById("create-comment-form").reset();
        } else {
          let imageId = image.value;
          e.preventDefault();
          // let author = document.getElementById("comment-name").value;
          let content = document.getElementById("comment-content").value;

          document.getElementById("create-comment-form").reset();
          apiService.addComment(imageId, username, content);
          loadcomments(imageId);
        }
      });
    if (cur_gallery) loadimage(cur_gallery); //load image has loadcomments inside
    // let image = document.getElementById("image-id");
    // if (image !== null) loadcomments(image.value);
    document.getElementById("next-btn").addEventListener("click", function (e) {
      e.preventDefault();
      let image = document.getElementById("image-id");
      if (image !== null) {
        let cur_id = image.value;

        // let next_img = await
        apiService.getNextImage(cur_gallery, cur_id).then((next_img) => {
          if (next_img) {
            loadimage(cur_gallery, next_img._id);
            // document.getElementById("image-id").value
            // loadcomments(next_img._id);
          } else {
            let image = document.getElementById("image-id");
            if (image !== null) loadcomments(image.value);
            window.alert("no next image");
          }
        });
      }
    });

    document
      .getElementById("previous-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        let image = document.getElementById("image-id");

        if (image !== null) {
          let cur_id = image.value;

          // let previous_img = await
          apiService
            .getPreviousImage(cur_gallery, cur_id)
            .then((previous_img) => {
              if (previous_img) {
                loadimage(cur_gallery, previous_img._id);
                // document.getElementById("image-id").value
                // loadcomments(previous_img._id);
              } else {
                window.alert("no previous image");
              }
            });
        }
      });

    document
      .getElementById("previous-comments")
      .addEventListener("click", function (e) {
        e.preventDefault();
        let pageId = String(
          Number(document.getElementById("page-id").value) - 1
        );
        let imageId = document.getElementById("image-id").value;
        let updated = loadcomments(imageId, pageId);
        if (updated) {
          document.getElementById("page-id").innerHTML = `${pageId}`;
        }
      });

    document
      .getElementById("previous-btn-galleries")
      .addEventListener("click", function (e) {
        e.preventDefault();
        let pageId = String(
          Number(document.getElementById("gallery-page-id").value) - 1
        );
        // let imageId = document.getElementById("image-id").value;
        // let updated = loadcomments(imageId, pageId);
        let updated = loadgalleries(pageId);
        if (updated) {
          document.getElementById("gallery-page-id").innerHTML = `${pageId}`;
        }
      });
    document
      .getElementById("next-btn-galleries")
      .addEventListener("click", function (e) {
        e.preventDefault();
        let pageId = String(
          Number(document.getElementById("gallery-page-id").value) + 1
        );
        // let imageId = document.getElementById("image-id").value;
        // let updated = loadcomments(imageId, pageId);
        let updated = loadgalleries(pageId);
        if (updated) {
          document.getElementById("gallery-page-id").innerHTML = `${pageId}`;
        }
      });
    document
      .getElementById("next-comments")
      .addEventListener("click", function (e) {
        e.preventDefault();

        let pageId = String(
          Number(document.getElementById("page-id").value) + 1
        );

        let imageId = document.getElementById("image-id").value;
        let updated = loadcomments(imageId, pageId);
        if (updated) {
          document.getElementById("page-id").innerHTML = `${pageId}`;
        }
      });
    document
      .getElementById("image-button")
      .addEventListener("click", function image(e) {
        e.preventDefault();
        showHideImageForm();
      });
    document
      .getElementById("comment-button")
      .addEventListener("click", function comment(e) {
        e.preventDefault();
        showHideCommentForm();
      });
  });
})();
