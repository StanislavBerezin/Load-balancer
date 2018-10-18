const mainControl = require("../controllers/MainController");


//recieves object of express app and makes routes

module.exports = (app) => {

    /**
     * Sets search word for twitter stream.
     */
    app.post("/specificSearch", mainControl.specSearch);


    app.post('/saveDB', mainControl.saveResults);

    app.post('/viewDB', mainControl.viewResults);



    //Establishes socket connection.


};