views folder
3 handlebars

use redirect
use cookies

DB
table signatures
-firstname
-lastname
-signature

db.js
getAllsignatures()
addSignature()

server.js
calls both getAllsignatures() and addSignature()

Browser makes GET request to:
/petition
/thanks
/signers

in server.js we need 3 requests
app.get(/petition)
app.get(/thanks)
app.get(/signers)

app.post (for sending form data) --> use middleware

views folder

<form method=POST action ="/petition"> </form>

make sure to use express.static.middleware
