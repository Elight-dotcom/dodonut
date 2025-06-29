const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const { authorize } = require('./middleware/authUser');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const port = 3000;

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use('/', require('./routes/custRoute'));
app.use('/admin', authorize, require('./routes/adminRoute'));
app.use((req, res) => {
    res.render('pages/404')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))