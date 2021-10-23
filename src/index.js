require("dotenv").config({ path: process.cwd() + "/.env" });

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT ? process.env.PORT : 4444;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(404).send("Not found");
});

app.post("/send-email", (req, res) => {
  try {
    const apiKeyClientHeader = req.headers.apikey;
    const { text, subject } = req.body;

    if (apiKeyClientHeader !== process.env.API_KEY) {
      throw { code: "forbidden" };
    }

    if (!text || text === undefined) {
      throw { code: "bad-request" };
    }

    if (!subject || subject === undefined) {
      throw { code: "bad-request" };
    }

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.FROM,
        pass: process.env.PASS,
      },
    });

    const message = {
      from: process.env.FROM,
      to: process.env.TO,
      subject,
      text,
    };

    transport.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
        throw new Error("Failed to send email");
      } else {
        console.log("Info: ", info);
        res.json({ status: true, message: "Successfully sent!" });
      }
    });
  } catch (error) {
    console.log(error);

    if (error.code === "bad-request") {
      res.status(400).send("Bad request");
    } else if (error.code === "forbidden") {
      res.status(401).send("Forbidden");
    } else {
      res.status(500).json({ error });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Simple nodemailer listening on port ${PORT}`);
});
