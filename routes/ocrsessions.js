var express = require('express');
var router = express.Router();
const path = require('path');

const fs = require('fs');
const https = require('https');
 

function getConfig(req)
{
    var config = {};
    config.PROJECT = process.env.PROJECT;
    config.GCS_UPLOAD_BUCKET = process.env.GCS_UPLOAD_BUCKET;
    config.GCS_PDF_FOLDER = process.env.GCS_PDF_FOLDER;
    config.GCS_IMAGE_FOLDER = process.env.GCS_IMAGE_FOLDER;
    config.UPLOAD_URL = process.env.UPLOAD_URL;
    config.LEVENSHTEIN_API = process.env.LEVENSHTEIN_API;
    config.CURRENT_USER =  { email : req.session.email, name : req.session.name };
    config.DOWNLOAD_OCR_PROCESSING_PROJECT = process.env.DOWNLOAD_OCR_PROCESSING_PROJECT;
    config.DOWNLOAD_OCR_PROCESSING_BUCKET = process.env.DOWNLOAD_OCR_PROCESSING_BUCKET;
    config.DOWNLOAD_OCR_PROCESSING_FOLDER = process.env.DOWNLOAD_OCR_PROCESSING_FOLDER;
    config.DOWNLOAD_OCR_RESULT_PROJECT = process.env.DOWNLOAD_OCR_RESULT_PROJECT;
    config.DOWNLOAD_OCR_RESULT_BUKCET = process.env.DOWNLOAD_OCR_RESULT_BUKCET;
    config.DOWNLOAD_OCR_RESULT_FOLDER = process.env.DOWNLOAD_OCR_RESULT_FOLDER;

  
    console.log(config);
    return config;
}

router.get("/add", function(req, res){
  
  //req.session.login = false;
  if(req.session.login != true)
    res.redirect("/login")
  else
  {
    let documentId = req.query.documentid;
    var dir = __dirname;
    var p = path.resolve( dir, "../public/pages/", "add-ocrsession");
    req.session.activeLink = "ocrsessions"

    res.render(p, { activeLink: "ocrsessions", session: req.session, sessionstring: JSON.stringify(req.session), documentid: documentId, config: JSON.stringify(getConfig(req)) } )
  }
});

router.get("", function(req, res){
  
    //req.session.login = false;
    if(req.session.login != true)
      res.redirect("/login")
    else
    {
      var dir = __dirname;
      var p = path.resolve( dir, "../public/pages/", "ocrsessions");
      req.session.activeLink = "ocrsessions"

      res.render(p, { activeLink: "ocrsessions", session: req.session, sessionstring: JSON.stringify(req.session), config: JSON.stringify(getConfig(req)) } )
    }
});

router.get("/view", function(req, res){
  //req.session.login = false;
  if(req.session.login != true)
    res.redirect("/login")
  else
  {
    let id = req.query.id;
    var dir = __dirname;
    var p = path.resolve( dir, "../public/pages/", "detail-ocrsession");
    req.session.activeLink = "ocrsessions"

    res.render(p, { activeLink: "ocrsessions", session: req.session, sessionstring: JSON.stringify(req.session), id: id, config: JSON.stringify(getConfig(req)) } )
  }
});

router.get("/view-ocr-result", function(req, res){
  
  //req.session.login = false;
  if(req.session.login != true)
    res.redirect("/login")
  else
  {
    let uri = req.query.uri;
    let id = req.query.id;
    let viewMode = "OCR_RESULT";
    var dir = __dirname;
    var p = path.resolve( dir, "../public/pages/", "new-template");
    req.session.activeLink = "ocrsessions"

    res.render(p, { activeLink: "ocrsessions",  session: req.session, sessionstring: JSON.stringify(req.session), id: id, uri: uri, viewMode: viewMode, config: JSON.stringify(getConfig(req)) } )
  }
});


module.exports = router;