const axios = require("axios").default;
const express = require("express");
const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");
const app = express();
app.get("/", async (req, res) => {
  console.log("link " + req.query.link);

  axios
    .get(req.query.link)
    .then(async resp => {
      console.log(resp.request.res.responseUrl);
      $ = cheerio.load(resp.data);
      ttable = $("#tbl > tbody");
      cheerioTableparser($);
      data = $(ttable).parsetable(true, true, false);
      // console.log(data)
      //console.log(data.length)
      var dayMap = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: []
      };
      var dayArray = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];
      for (i = 1; i < 7; i++) {
        let finaldata;
        for (j = 0; j < 15; j++) {
          {
            var faculty, subject, start, end, room;
            if (data[i][j] == data[i][j - 1]) {
              end = data[0][j].split(" - ")[1];
              continue;
            } else {
              m = data[i][j];
              finaldata = dayMap[dayArray[i - 1]];
              if (m.includes("<hr>")) {
                faculty =
                  m.split("<hr>")[0].split("<br>")[1] +
                  "/" +
                  m.split("<hr>")[1].split("<br>")[1];
                room = /(?<=\[R-)(.*)(?=])/gm.exec(m.split("<hr>")[0]) +
                  "/" +
                  /(?<=\[R-)(.*)(?=])/gm.exec(m.split("<hr>")[1]) || [
                  "Not found"
                ];
                subject =
                  m.split("<hr>")[0].split("[")[0] +
                  "/" +
                  m.split("<hr>")[1].split("[");
              } else if (m.includes("color")) {
                faculty = "";
                subject = cheerio.load(m).text();
                room = "";
              } else {
                subject = m.split("<br>")[0].split("[")[0];
                faculty = m.split("<br>")[1];
                room = /(?<=\[R-)(.*)(?=])/gm.exec(m) || ["null"];
              }
              start = data[0][j].split(" - ")[0];
              finaldata.push({
                subject: subject,
                faculty: faculty,
                room: room[0],
                start: start
              });
            }
          }
        }
      }
      final = JSON.stringify(dayMap, null, 4);
      res.send(final);
    })
    .catch(function(error) {
      // handle error
      res.status(404);
      res.send("not found");
    });
});
app.listen(3001, () => console.log(`listening on port 3000!`));
