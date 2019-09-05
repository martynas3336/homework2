### Description

This is a simple web project made for listing large data using ajax for front-end and node.js for back-end code. MySQL database is used for data storage. This project is not the best and most efficient example of how large data should be handled, but at least it is very dynamic.

### How to run

For front-end simply use some web server like nginx to route to www folder.

For back-end you are going to need to install node.js and all required packages and then run node app/server.js. For consistency I would recommend using pm2 process manager in case something crashes or goes wrong.

### How does it work

#### Front-end

This application uses jquery library.

Main table is being handled my ListManager class. You must parse required dom elements to the constructor, which will look for changes and accordingly send new xhr to web server. Once the response from the server is received, everything is fetched to the page, including pages, headers and data. 

Last selected(clicked on) data is marked and fetched on the screen.

Front-end has a bad support for cross-browser compability, since it uses class and promise keywords.

#### Back-end

This application uses node.js, express.js and MySQL.

Back end is a little bit unorganized, but I do not see the need to split it into smaller parts considering the small size of it. Backend app is ran with express. It accepts only one url /api/list with perPage, page, orderBy parameters. Before quering the main data from database, server will query for the amount of data and column names, which will later be processed and sent to the client. Based on received parameters from client, query to MySQL is being sent. Once responce from MySQL reaches the application, application sends response to the client with maxPage, headers, keyIdentifier and result response.

keyIdentifier specifies column name, which is unique.
