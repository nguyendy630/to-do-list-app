# Requirements
Create a React Native application and NodeJS backend for a TODO list application.

The items in the TODO list should be simple text strings, or example: "brush teeth", "study for "test", etc.  

You should assume the NodeJS backend has been started before the React Native application.  The NodeJS backend should run on localhost on port 3001.  The NodeJS backend should manage the storage of the TODO list items in a Redis database.  When the NodeJS application first starts up, it should create an initially empty list of TODO items in the Redis database.  Exactly how you manage this is up to you, but when the NodeJS application starts up some sort of key should be set in the Redis database to represent that no TODO list items exist yet.  The NodeJS backend should support three routes which have been created using Express:

A load route should be accessible when a GET request is made to http://localhost:3001/load.  A request to this route should result in the server sending back a response containing in the response body a JSON array of the TODO list items that have been retrieved from the Redis database.  
It is possible the TODO list items could be empty, in which case the response should be: []
But it might look like this if these TODO list items existed: ["brush teeth",  "study for test"]
A save route should be accessible when a POST request is made to http://localhost:3001/save.  A request to this route should have a request body containing a JSON array of the TODO list items, and the response from the server should have a body with this JSON object: {status: "save successful"}.  The TODO list items in the request body should be stored into the Redis database as the new TODO list, replacing whatever TODO list data was previously stored in the Redis database.
For example the request body might look like this: ["brush teeth", "study for test"]
A clear route should be accessible when a GET request is made to http://localhost:3001/clear.  A request to this route should result in the server sending back a response with the response body containing this JSON object: {status: "clear successful"}.  The Redis database should be updated so that the TODO list is now empty/blank.
These routes will allow the React Native application to load, save and clear the TODO list items.  

When the React Native application itself first launches, it should perform a request to the load route to retrieve any TODO list items stored in the Redis database.  It should store these items as part of a component's state.  These TODO list items should be displayed in a list in the application itself.  Of course if the backend was just started and then the React Native application is run for the first time, this list will initially be empty.  

The user should be able to enter input into a textbox and tap an "Add" button to add a new item to the TODO list.

The user should be able to tap a "delete icon" (e.g. a garbage can or X or something) or image next to each TODO list item to delete the item from the list.  

The user should be able to tap an "edit icon" (e.g. a notepad or something) or image next to each TODO list item to edit the item.  When the user taps this icon or image, the textbox that is normally used for adding a new item should be populated with the text of the item that was tapped, and the "Add" button should be replaced with an "Edit" button.  When the user changes the item text using the textbox and taps on the "Edit" button, the item's text should be changed in the list, the textbox should be made empty, and the "Edit" button should again be replaced with the "Add" button.

Doing any of the three above add, delete or edit actions should ONLY update the component state and the list displayed in the React Native application, it should NOT cause a request to occur to the backend or for the Redi database to be updated.

At the top of the React Native application, above the list of TODO list items, should be three buttons: Save, Restore and Clear.  When the Save button is clicked, a request should occur to the backend which causes the current TODO list items displayed in the React Native application to be saved into the Redis database.  When the Restore button is clicked, a request should occur to the backend which causes the current TODO list items displayed in the React Native application to be replaced with whatever TODO list items were stored in the Redis database.  When the Clear button is clicked, a request should occur to the backend which causes the TODO list items in the Redis database to be cleared and set to empty, and the TODO list items displayed in the React Native application should also be made empty.

So if the backend is first started, and then the React Native application, and the user were to add some items to the list and then tap save, and then close the React Native application and start it up again, those items that were created should appear in the TODO list that is displayed when the application loads.  

# Demo Video

Create a demonstration video that demonstrates your application.  Show both the backend and frontend running, then demonstrate all the features of the application.  The application can either be demonstrated as a web, Android or iOS application.  The video should be no longer than 5 minutes.  The expectations for the presentation quality of the demonstration video are not high... as long as you show your React Native application and talk about these points with comprehensible audio and visual quality, that is all that is expected. 

# Submission Instructions
Place your NodeJS server code in a folder called /backend and your React Native code in a folder called /frontend.  Both folders should include package.json files, use Expo locally on the command-line for this assignment and NOT Expo Snack.  Delete the node_modules folders for both the frontend and backend folders, otherwise the zip file will be extremely large.  Your solution should work when it is unzipped and the commands npm install followed by npm start are run in the backend directory, followed by running the same commands in the frontend directory... nothing more should be required to run your application.  When you have completed the assignment zip your frontend and backend folders in a zip file named as6_FirstName_LastNAme.zip and submit it using MyCanvas.  

You can either upload your demo video as an mp4 file called demo.mp4, or you can include a URL for an unlisted YouTube video in a plaintext file called video.txt (the video cannot be set to 'private' or the instructor cannot see it, it must be 'unlisted' so the instructor can see it using the link provided).

Failure to follow submission instructions may result in a mark deduction up to receiving a mark of zero on the assignment.

# Statement of Authorship
Copying others people work and claiming it as your own is a serious breach of ethics. If copied work is found, all parties involved will receive a failing grade as per departmental policy. Group work is encouraged but it is expected that you do your own work. If you do, you'll learn the material and feel better for it. Since all work submitted is assumed to be your own original work, you must include the following "Statement of Authorship":

"StAuth10244: I John Doe, 123456 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else."

Use the exact text above. No substitutions.
Replace John Doe with your name and the number 123456 with your student ID.
Place this text as one line as close to the top of each document as possible.
Include StAuth10244: at the beginning of each statement.
Failure to include this statement will cause your work to be ineligible for grading.