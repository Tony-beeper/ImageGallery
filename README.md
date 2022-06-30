# Description

  An ImageGallery implemented for course CSCC09(Programming on the Web).

## Tech used

### Frontend:
  * Javscript
  * Html/CSS


### Backend:
  * NEDB
  * Node/Express.Js
  * multer/fetch
  * bcrypt/session/cookies

## Highlighted functionalities
  * Image upload and comment on images
  * Individual user has his/her own gallery
  * nedb database to manage user information(e.g. signup, signin, comments, images source etc)
  * rolebase access with cookie and session
  * encrytion with bcrypt
  
## Setup

1. run `npm install`
2. create a .env file and name a SESSION_SECRET to a random string as session secret for app.js, such as SESSION_SECRET = "AS1H3J92J2H7392TGVSH".
   need to run npm instsall --save dotenv first, if solely npm install does not work.
3. run `node app.js` in the main directory

## Demo image
![alt text](https://github.com/Tony-beeper/ImageGallery/blob/main/static/media/demoImage.png?raw=true)

