const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');

const app = express();

const upload = multer({ dest: 'uploads/' });

const files = JSON.parse(fs.readFileSync('files.json'));
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
let data = []; 

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { files: files });
});

app.post('/upload', upload.single('csv'), (req, res) => {
  // Check if req.file is defined before accessing its properties
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // Parse uploaded CSV file
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Delete uploaded file from server
      fs.unlinkSync(req.file.path);

      // Store file details in files array
      const file = {
        name: req.file.originalname,
        size: req.file.size,
        date: new Date().toISOString(),
      };

      // Write files array to files.json
      files.push(file);
      fs.writeFileSync('files.json', JSON.stringify(files));

      // Update data with parsed CSV rows
      data = results;

      res.render('uploadaux', { data: data });
    });
});

app.post('/sort', (req, res) => {
    console.log(req.body);
  const keys = req.body.keys;
  const filteredData = data.map(item => {
    const filteredItem = {};
    keys.forEach(key => {
      filteredItem[key] = item[key];
    });
    return filteredItem;
  });
  res.render('uploadaux', { data: filteredData });
});





app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
