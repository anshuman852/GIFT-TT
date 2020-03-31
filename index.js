const axios = require("axios").default;
const express = require("express");
const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");
const app = express();
app.get("/gift/tt", async (req, res) => {
  let link =
    req.query.link +
    "&b=" +
    req.query.b +
    "&sem=" +
    req.query.sem +
    "&st=" +
    req.query.st +
    "&s=" +
    req.query.s;
  //console.log(link);
  //console.log(req.body);

  axios
    .get(link)
    .then(async resp => {
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
                room =
                  /(?<=\[R-)(.*)(?=])/gm.exec(m.split("<hr>")[0])[0] +
                    "/" +
                    /(?<=\[R-)(.*)(?=])/gm.exec(m.split("<hr>")[1])[1] || "";
                subject =
                  m.split("<hr>")[0].split("[")[0] +
                  "/" +
                  m.split("<hr>")[1].split("[")[0];
              } else if (m.includes("color")) {
                faculty = "";
                subject = cheerio.load(m).text();
                room = "";
              } else {
                subject = m.split("<br>")[0].split("[")[0];
                faculty = m.split("<br>")[1];
                room = /(?<=\[R-)(.*)(?=])/gm.exec(m)[0] || "";
              }
              start = data[0][j].split(" - ")[0];
              finaldata.push({
                subject: subject,
                faculty: faculty,
                room: room,
                start: start
              });
            }
          }
        }
      }
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(dayMap, null, 4));
    })
    .catch(function(error) {
      // handle error
      res.status(404);
      res.send("not found");
    });
});
app.get("/gift/tt/list", async (req, res) => {
  url = "https://timetable.gift.edu.in/";
  axios
    .get(url)
    .then(async resp => {
      $ = cheerio.load(resp.data);
      ttable = $("body > table > tbody");
      cheerioTableparser($);
      data = $(ttable).parsetable();
      let finaldata = [];
      for (i = 1; i < data[0].length; i++) {
        ok = cheerio.load(data[1][i]);
        finaldata.push({
          title: ok.text().replace("B.Tech", "BTECH"),
          link: url + ok("a").attr("href")
        });
      }
      finaldata = JSON.stringify(finaldata, null, 4);
      res.header("Content-Type", "application/json");
      res.send(finaldata);
    })
    .catch(function(error) {
      res.status(404);
      res.send();
    });
});
app.listen(3001, () => console.log(`listening on port 3001!`));
