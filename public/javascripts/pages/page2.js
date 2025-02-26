var Page2 = {

    json: {},
    PDF : null,
    CUR_PAGE : 1,
    PAGE :  null,
    PDFJS : null,
    TABLELEFT:207,
    TABLETOP:586,
    IMAGES: [],
    imageInProcess: null,
    rotation: 0,
    translation: 0,
    actions: [],
    rotateRun: false,
    scale: 1,
    ocr: function(page, callback)
    {
        console.log("OCR")
        Page2.imageBox2Text(page, function(response)
        {
            console.log("RESPONSE FROM PARSE");
            console.log(response);

            let data =  response.payload;
            data = Page2.toTable(data);

            Page2.json.table = data;

            $("#json-area").text(JSON.stringify(Page2.json))

            console.log(data);
            Page2.displayTableResult(data);
            
            if(callback != null)
                callback();

        })
    }
    ,
    tooltips: function()
    {
        //console.log($("button[tooltip]"))
        $("button[tooltip]").each(function (idx)
        {   
            let tooltip = $(this).attr("tooltip")
            console.log("tooltip")
            console.log(tooltip)
            tippy(this, {
                content: tooltip,
                theme: 'tomato'
              });      

        })

    }
    ,
    toTable: function(data)
    {
        let rows = [];
        let totalRows = data.length;
        let totalCols = data[0].length;
    
        for(var i = 0; i < totalRows; i++)
        {
            let row = [];
            for(var j = 0; j < totalCols; j++)
            {
                row.push(data[i][j].text);
            }
    
            rows.push(row);
        }
        return rows;
    }
    ,
    displayTableResult: function(data)
    {
        console.log("display result")
        let tbl = document.createElement("table")
        $(tbl).attr("style", "width: 100%; border: solid 1px #ccc")
        $("#table-content").html("");

        let rowIdx = 0;
        data.forEach((row)=>{
            
            let colIdx = 0;
            let tr = document.createElement("tr")
            row.forEach((cell)=>{
            
                let td = document.createElement("td");
                $(td).attr("style", "border: solid 1px #ccc; padding: 2px")
                $(td).attr("col", colIdx)
                $(td).attr("row", rowIdx)
                $(td).html(cell);
                $(tr).append(td);
                colIdx++;
            })

            $(tbl).append(tr);
            rowIdx++;
        })

        $("#table-content").append(tbl);
        HudaTableEditor.apply(tbl, function(data){
            Page2.json.table = data
            $("#json-area").text(JSON.stringify(Page2.json))
        });
    }
    ,
    getImageFilename: function(page)
    {
        let filename = decodeURIComponent(Page2.FILE_URI).split("/");
            filename = filename[filename.length - 1];
            filename = filename.replace(".pdf", "");
            filename += "-page-" + page;
            filename += ".png";
        return filename;
    }
    
    , 
    getOriJsonFilename: function(page)
    {
        let filename = decodeURIComponent(Page2.FILE_URI).split("/");
            filename = filename[filename.length - 1];
            filename = filename.replace(".pdf", "");
            filename += "-page-ori-" + page;
            filename += ".json";
        return filename;
    }
    , 
    getResultJsonFilename: function(page)
    {
        let filename = decodeURIComponent(Page2.FILE_URI).split("/");
            filename = filename[filename.length - 1];
            filename = filename.replace(".pdf", "");
            filename += "-result-" + page;
            filename += ".json";
        return filename;
    }
    , 
    getResultJsonBaseFilename: function(page)
    {
        let filename = decodeURIComponent(Page2.FILE_URI).split("/");
            filename = filename[filename.length - 1];
            filename = filename.replace(".pdf", "");
            filename += "-result-";
        return filename;
    }
    ,
    getCsvFilename: function(page)
    {
        let filename = decodeURIComponent(Page2.FILE_URI).split("/");
            filename = filename[filename.length - 1];
            filename = filename.replace(".pdf", "");
            filename += "-page-" + page;
            filename += ".csv";
            filename = TYPE + "_" + filename;
        return filename;
    }
    ,
    getOriJsonUrl: function(page)
    {
        let filename = Page2.getOriJsonFilename(page);
        return Page2.getBaseFileUri() + "/" + Page2.GCS_BUCKET + "/" + Page2.GCS_JSON_FOLDER + "/" +  filename;
    }
    ,
    getImageFilename: function(page)
    {
        let filename = decodeURIComponent(FILE_URI).split("/");
            filename = filename[filename.length - 1];
            filename = filename.replace(".pdf", "");
            filename += "-page-" + page;
            filename += ".png";
        return filename;
    }
    ,
    getImageUrl: function(page)
    {
        let filename = Page2.getImageFilename(page);
        return Page2.getBaseFileUri() + "/" + Page2.GCS_BUCKET + "/" + Page2.GCS_IMAGE_FOLDER + "/" +  filename;
    }
    ,
    getBaseFileUri: function()
    {
        let uri = decodeURIComponent(FILE_URI);
        uri = uri.replace("http://", "");
        uri = uri.replace("https://", "");
    
        uri = uri.split("/");
        let host = uri[0];
        uri = "https://" + host;
        return uri;
    }
    ,
    downloadJson: function(jsonFilename, callback)
    {
        $.get("/web/download/" + jsonFilename, function(response){
            if(callback != null)
                callback(response)
        })
    }
    ,
    imageBox2Text: function(page, callback)
    {
    
        let jsonFileUrl = Page2.getOriJsonUrl(page);
        console.log(jsonFileUrl)
        jsonFileUrl = encodeURIComponent(jsonFileUrl);
    
        let imagefileUrl = Page2.getImageUrl(page);
        imagefileUrl =  encodeURIComponent(imagefileUrl);
    
        console.log("imageBox2Text Download Json")
        console.log(jsonFileUrl);
    
        Page2.downloadJson(jsonFileUrl, function(json){
            console.log("JSON " + jsonFileUrl);
            
    
            if(typeof json == 'object')
                json = JSON.stringify(json);
    
            if(json.indexOf("<?xml") == -1)
            {
                json = JSON.parse(json);
                console.log("json1");
                let headers = json.headers;

                json = { positions: json.rows }
                json.positions.unshift(headers)
                

                console.log("json2");
                console.log(json);
            
                json = JSON.stringify(json)
                console.log("Json to send to parse")
                console.log(json);

                
    
                let url = "/table/parse-by-boxes/" + imagefileUrl;
                $.post(url, json, function(response){
                    
                    if(callback != null)
                        callback(response);
                }).fail(function(){
                    //run(CUR_PAGE);
                    //alert("Parsing failed. Please fix the table for this page.")
                })
                

            }
            else
            {
                //CUR_PAGE = PREV_PAGE;
                $.notify("The pdf page " + page + " does not have table defined. If you have defined the table, please save first", "error")
                $("#processgif").hide();
            }
    
    
        })
    }
    ,
    parseForm: function(callback, callbackError)
    {
        let url = "/formparser/parse/" + encodeURIComponent(Page2.FILE_URI);
        console.log("url")
        console.log(url);

        $.get(url, function(result){
            console.log("parseForm result");
            console.log(result);
            
            Page2.json.form = result.payload;
            $("#json-area").text(JSON.stringify(Page2.json))
            if(callback != null)
                callback(result.payload)
        })
    }
    ,
    createBox: function(points)
    {
        let x1 = points[0].x;
        let y1 = points[0].y;
        let w = points[1].x - points[0].x;
        let h = points[2].y - points[1].y;

        let imgWidth = $("#pdf-canvas").width();
        let imgHeight = $("#pdf-canvas").height();


        let tbl = document.createElement("div");
        $(tbl).css("width", w * imgWidth);
        $(tbl).css("height", h * imgHeight);
        $(tbl).css("border", "solid 2px red");
        $(tbl).css("position", "absolute");
        $(tbl).css("left", x1 * imgWidth);
        $(tbl).css("top", y1 * imgHeight);
        $(tbl).attr("class", "bbox")

        return tbl;
    }
    ,
    displayFormBoundingBox: function(forms)
    {
        let x = $("#right-displayer").position().left;
        let y = $("#right-displayer").position().top;

        $("#form-boxes").css("position", "absolute");
        $("#form-boxes").css("left", x);
        $("#form-boxes").css("top", y);

        forms.map((form)=>{
            let fieldBox = Page2.createBox(form.fieldBox);
            let fieldValueBox = Page2.createBox(form.fieldValueBox);

            $(fieldBox).attr("data", form.field)
            $(fieldValueBox).attr("data", form.fieldValueBox)

            $(fieldBox).attr("box-id", form.fieldId);
            $(fieldValueBox).attr("box-id", form.fieldValueId)

            $(fieldBox).on("click", function(){
                let boxId = $(this).attr("box-id");
                $("td[box-id]").css("background-color", "transparent")
                $("div[box-id]").css("border-color", "red")
                $("td[box-id=" + boxId + "]").css("background-color", "#ccc")
            })

            $(fieldValueBox).on("click", function(){
                let boxId = $(this).attr("box-id");
                $("td[box-id]").css("background-color", "transparent")
                $("div[box-id]").css("border-color", "red")
                $("td[box-id=" + boxId + "]").css("background-color", "#ccc")
            })

            $("#form-boxes").append(fieldBox)
            $("#form-boxes").append(fieldValueBox)
        })
    }
    ,
    makeid: function(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
            charactersLength));
       }
       return result;
    }
    ,
    createFormIds: function(forms)
    {
        forms.map((form)=>{
            form.fieldId  = Page2.makeid(10);
            form.fieldValueId = Page2.makeid(10);
        })
        return forms;
    }
    ,
    displayForm: function(forms)
    {
        forms = Page2.createFormIds(forms)
        
        $("#form-content").html("")
        let tbl = document.createElement("table")
        forms.map((form)=>{

            let tr = document.createElement("tr")
            let td1 = document.createElement("td")
            if(form.fieldConfidence < 0.9)
                $(td1).attr("style", "color: red")
            $(td1).html(form.field);
            let td2 = document.createElement("td")

            $(td2).html("&nbsp;&nbsp;:&nbsp;&nbsp;");
            let td3 = document.createElement("td")

            if(form.fieldValueConfidence < 0.5)
                $(td3).attr("style", "color: red")
            $(td3).html(form.value);

            
            $(td1).attr("box-id", form.fieldId)
            $(td3).attr("box-id", form.fieldValueId)

            $(tr).append(td1);
            $(tr).append(td2);
            $(tr).append(td3);
            $(tbl).append(tr);
        })

        $("#form-content").append(tbl);
        HudaTableEditor.apply(tbl, function(data){
            Page2.json.form = data;
            $("#json-area").text(JSON.stringify(Page2.json))
        }, function(td){
            $("td[box-id]").css("background-color", "transparent")
            let boxId = $(td).attr("box-id");
            $("div[box-id]").css("border-color", "red")
            $("div[box-id=" + boxId + "]").css("border-color", "green")

        });

        Page2.displayFormBoundingBox(Page2.json.form)

    }
    ,
    uploadJsonFile: function(filename, content, callback)
    {
        let filepath = Page2.GCS_JSON_FOLDER + "/" + filename;
        filepath = encodeURIComponent(filepath);

        //var url = Page2.UPLOAD_BASE_URL + "/upload/gcs-create-file/" + Page2.PROJECT + "/" + Page2.GCS_BUCKET + "/" + filepath;
        var url = Page2.UPLOAD_BASE_URL + "/gcs/create?path=" + Page2.PROJECT + ":" + Page2.GCS_BUCKET + "/" + filepath;

        console.log("create file url");
        console.log(url);

        let sJson = JSON.stringify({
            content: JSON.stringify(content)
        });

        $.post(url, sJson, function(response){
            console.log("response");
            console.log(response);
            if(callback != null)
                callback(response);
        })

    }
    ,
    savePDFImage: function(callback)
    {
        var page  = Page2.PAGE;

        var canvas = document.getElementsByTagName("canvas")[0];
        let imageData = canvas.toDataURL('image/png');

        let filename = Page2.getCurrentImageFilename();
        let originalFilename = filename;
    

        var ImageURL = imageData;
        // Split the base64 string in data and contentType
        var block = ImageURL.split(";");
        // Get the content type of the image
        var contentType = block[0].split(":")[1];// In this case "image/gif"
        // get the real base64 content of the file
        var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."

        // Convert it to a blob to upload
        var blob = Page2.b64toBlob(realData, contentType);

        let form  = document.createElement("form");

        // Create a FormData and append the file with "image" as parameter name
        var formDataToUpload = new FormData(form);
        formDataToUpload.append("file", blob, originalFilename);

        //var url = Page2.UPLOAD_BASE_URL + "/upload/gcs/" + Page2.PROJECT + "/" + Page2.GCS_BUCKET + "/" + Page2.GCS_IMAGE_FOLDER;
        var url = Page2.UPLOAD_BASE_URL + "/gcs/upload?path=" + Page2.PROJECT + ":" + Page2.GCS_BUCKET + "/" + Page2.GCS_IMAGE_FOLDER + "/";

        // Submit Form and upload file
        $.ajax({
                    url:url,
                    data: formDataToUpload,// the formData function is available in almost all new browsers.
                    type:"POST",
                    contentType:false,
                    processData:false,
                    cache:false,
                    dataType:"json", // Change this according to your response from the server.
                    error:function(err){
                        alert(err)
                        console.error(err);
                    },
                    success:function(data){
                        console.log("-----data-----")
                        console.log(data);
                        if(callback != null)
                            callback(data);
                    },
                    complete:function(){
                        
                        console.log("Request finished.");
                    }
                });
        
        //console.log(imageData);
    }
    ,
    getCurrentImageFilename: function()
    {
        let filename = decodeURIComponent(Page2.FILE_URI).split("/");
            filename = filename[filename.length - 1];
            filename = filename.replace(".pdf", "");
            filename += "-page-" + Page2.CUR_PAGE;
            filename += ".png";
        return filename;
    }
    ,
    showPDF2: function(url, callback)
    {

        let url2 = url.replace("gs://", "https://storage.googleapis.com/")
        url2 = url2.replace("/documents/download/", "")
        $("#processgif").show();
        Page2.getAllPageTemplatesByDocument(url2).then((pageTemplates)=>{
            Page2.pageTemplates = pageTemplates;

            console.log("pageTemplates")
            console.log(pageTemplates)

            //Set local page images from page templates in database
            Page2.setImagesFromPageTemplates(pageTemplates, 0, function(){
                
                $("#processgif").hide();

                // Loaded via <script> tag, create shortcut to access PDF.js exports.
                var pdfjsLib = window['pdfjs-dist/build/pdf'];

                // The workerSrc property shall be specified.
                pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

                Page2.PDFJS = pdfjsLib;

                // Asynchronous download of PDF
                var loadingTask = pdfjsLib.getDocument(url);
                
                loadingTask.promise.then(function(pdf) {
                    console.log('PDF loaded');
                    Page2.PDF = pdf;
                    Page2.openPage(Page2.PDF, 1, callback);

                    $("#page-info").html("Page : " + Page2.CUR_PAGE + " of " + Page2.PDF.numPages);

                }, function (reason) {
                // PDF loading error
                    console.error(reason);
                    $.notify(reason.message, "error")
                });

            })
        }).catch(err=>{
            $("#processgif").hide();
        })


    }
    ,
    setImagesFromPageTemplates: function(pageTemplates, idx, callback)
    {
        if(idx < pageTemplates.length)
        {
            let imgUrl = pageTemplates[idx].pageImageUrl;
            let page = pageTemplates[idx].page;
            let img = new Image();
            //$(img).attr("crossOrigin")
            img.crossOrigin = "anonymous"
            img.onload = function()
            {
                console.log("imgUrl : page , " + imgUrl + ", " + page )
                Page2.IMAGES[page] = img;
                Page2.setImagesFromPageTemplates(pageTemplates, idx+1, callback)
            }
            img.src = imgUrl;
        }
        else 
        {
            if(callback != null)
                callback ()
        }
    }
    ,
    openPage: function(pdf, pageNumber, callback)
    {

        Page2.actions = [];
        Page2.imageInProcess = null;
        $("#processgif").show();
        
        // Fetch the first page
        //var pageNumber = 1;


        if(pageNumber in Page2.IMAGES)
        {
            Page2.displayImage(Page2.IMAGES[pageNumber])
            TableResizer.clear("divPdfTable");
            Page2.getAndDisplayCurrentPageTemplate("divPdfTable")
        }
        else 
        {
            console.log("pdf.getPage")
            pdf.getPage(pageNumber).then(function(page) {

                $("#processgif").hide();
                console.log('Page loaded');
                Page2.PAGE = page;
                
                var scale = Page2.scale;
                var viewport = page.getViewport({scale: scale});
    
                // Prepare canvas using PDF page dimensions
                var canvas = document.getElementById('pdf-canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
    
                console.log("page.view")
                console.log(viewport)
    
                Page2.DOCUMENT_WIDTH = Math.round(viewport.width);
                Page2.DOCUMENT_HEIGHT = Math.round(viewport.height);
    
                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.promise.then(function () {
                    //console.log(canvas.toDataURL('image/jpeg'));
                    console.log('Page rendered');
                    //Page2.saveDisplayedImage();
                    
                    if(callback != null)
                        callback();
                });
    
                TableResizer.clear("divPdfTable");
                Page2.getAndDisplayCurrentPageTemplate("divPdfTable")
            });

        }

    },
    zoomPage: function(pdf, pageNumber, docscale, callback)
    {
        Page2.scale = docscale;
        // alert("zoomInPage: "+Page2.scale)
        Page2.actions = [];
        Page2.imageInProcess = null;
        $("#processgif").show();
        
        // Fetch the first page
        //var pageNumber = 1;


        if(pageNumber in Page2.IMAGES)
        {
            
            Page2.displayImage(Page2.IMAGES[pageNumber])
            TableResizer.clear("divPdfTable");
            Page2.getAndDisplayCurrentPageTemplate("divPdfTable")
        }
        else 
        {
            console.log("pdf.getPage")
            pdf.getPage(pageNumber).then(function(page) {

                $("#processgif").hide();
                console.log('Page loaded');
                Page2.PAGE = page;
                
                var scale = Page2.scale;
                var viewport = page.getViewport({scale: scale});
    
                // Prepare canvas using PDF page dimensions
                var canvas = document.getElementById('pdf-canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
    
                console.log("page.view")
                console.log(viewport)
    
                Page2.DOCUMENT_WIDTH = Math.round(viewport.width);
                Page2.DOCUMENT_HEIGHT = Math.round(viewport.height);
    
                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.promise.then(function () {
                    //console.log(canvas.toDataURL('image/jpeg'));
                    console.log('Page rendered');
                    //Page2.saveDisplayedImage();
                    
                    if(callback != null)
                        callback();
                });
    
                TableResizer.clear("divPdfTable");
                Page2.getAndDisplayCurrentPageTemplate("divPdfTable")
            });

        }

    }
    ,
    displayImage: function(img)
    {
        console.log('displayImage')
    
        var canvas=document.getElementById("pdf-canvas");
        var ctx=canvas.getContext("2d");
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        $(canvas).css("width", img.width )
        $(canvas).css("height", img.height )

        console.log("size " + img.width + ", " + img.height)
        // ctx.drawImage(img, img.width / Page2.scale, img.height / Page2.scale, img.width / Page2.scale, img.height / 2, 0, 0, canvas.width, canvas.height);
        if(Page2.scale > 0.01){
            ctx.drawImage(img, 0, 0, canvas.width * Page2.scale, canvas.height * Page2.scale)        
        }else{
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)        
        }

    }
    ,
    saveDisplayedImage: function()
    {
        console.log("saveDisplayedImage")
        var canvas=document.getElementById("pdf-canvas");
        let img = document.createElement("img")
        img.id  = Page2.CUR_PAGE;
        //$(img).attr("crossOrigin")
        img.crossOrigin = 'Anonymous';
        img.onload = function()
        {
            console.log("image.onload() on  "  + Page2.CUR_PAGE)
            Page2.IMAGES[Page2.CUR_PAGE] = img; 
        }
        img.src = canvas.toDataURL('image/png')   
    }
    ,
    rotate: function(degrees)
    {
        Page2.rotateRun = true;
        Page2.actions.push({ action: 'rotate(' + degrees + ')' })
        var canvas=document.getElementById("pdf-canvas");
        var ctx=canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        var image = document.createElement("img");
        image.id = "pic";

        if(Page2.imageInProcess == null)
        {
            console.log("here rotate")
            image.src = canvas.toDataURL("image/png");
            Page2.imageInProcess = image.src;
        }
        else
        {
            console.log("here else rotate")
            image.src = Page2.imageInProcess;
        }
        
        degrees = Page2.rotation + degrees
        Page2.rotation = degrees

        image.onload = function()
        {
            console.log('xxxxx')
            console.log(image.height)

    
            if(degrees == 90 || degrees == 270) {
                canvas.width = image.height;
                canvas.height = image.width;
            } else {
                canvas.width = image.width;
                canvas.height = image.height;
            }

            console.log('yyyyyy')
    
            ctx.clearRect(0,0,canvas.width,canvas.height);
            if(degrees == 90 || degrees == 270) {
                ctx.translate(Math.floor(image.height/2),Math.floor(image.width/2));
            } else {
                ctx.translate(Math.floor(image.width/2),Math.floor(image.height/2));
            }   
            ctx.rotate(degrees*Math.PI/180);
            console.log('zzzzzzz')
            ctx.drawImage(image,-image.width/2,-image.height/2);
    
            console.log('aaaaaaa')
            //let elm = document.getElementById("right-displayer")
            //elm.insertBefore(canvas, elm.firstChild );

            Page2.saveDisplayedImage();
        }
    }
    ,
    up: function(value)
    {
        if(Page2.rotateRun)
        {

            Page2.rotateRun = false;
            Page2.openPage(Page2.PDF, Page2.CUR_PAGE);

        }
        console.log("Up :  " + value)
        Page2.actions.push({ action: 'up(' + value + ')' })

        var canvas=document.getElementById("pdf-canvas");
        var ctx=canvas.getContext("2d");

        var image = document.createElement("img");
        image.id = "pic";
        image.src = canvas.toDataURL("image/png");

        image.onload = function()
        {
            console.log('here') 

            ctx.drawImage(image, 0, -value);
            Page2.imageInProcess = image.src;
            Page2.saveDisplayedImage();
        }

        Page2.rotateRun = false;

    }
    ,
    down: function(value)
    {
        if(Page2.rotateRun)
        {

            Page2.rotateRun = false;
            Page2.openPage(Page2.PDF, Page2.CUR_PAGE);

        }
        console.log("Down : " + value)
        Page2.actions.push({ action: 'down(' + value + ')' })

        var canvas=document.getElementById("pdf-canvas");
        var ctx=canvas.getContext("2d");

        var image = document.createElement("img");
        image.id = "pic";
        image.src = canvas.toDataURL("image/png")

        image.onload = function()
        {
            console.log('here')
            ctx.drawImage(image, 0,value);
            Page2.imageInProcess = image.src;
            Page2.saveDisplayedImage();
        }
        Page2.rotateRun = false;
    }
    ,
    left: function(value)
    {
        if(Page2.rotateRun)
        {

            Page2.rotateRun = false;
            Page2.openPage(Page2.PDF, Page2.CUR_PAGE);

        }
        var canvas=document.getElementById("pdf-canvas");
        var ctx=canvas.getContext("2d");

        var image = document.createElement("img");
        image.id = "pic";
        image.src = canvas.toDataURL("image/png");

        image.onload = function()
        {
            console.log('here')
            console.log(image.height)
            
            ctx.drawImage(image, -value,0);
            Page2.imageInProcess = image.src;
            Page2.saveDisplayedImage();
        }
        Page2.rotateRun = false;
    }
    ,
    right: function(value)
    {
        if(Page2.rotateRun)
        {

            Page2.rotateRun = false;
            Page2.openPage(Page2.PDF, Page2.CUR_PAGE);

        }
        var canvas=document.getElementById("pdf-canvas");
        var ctx=canvas.getContext("2d");

        var image = document.createElement("img");
        image.id = "pic";
        image.src = canvas.toDataURL("image/png");

        image.onload = function()
        {
            console.log('here')
            console.log(image.height)
            
            ctx.drawImage(image, value,0);
            Page2.imageInProcess = image.src;
            Page2.saveDisplayedImage();
        }
        
    }
    ,
    retrieveResultJson: function( callback, callbackError)
    {
        let jsonFilename =  Page2.getResultJsonFilename(Page2.CUR_PAGE);
        let downloadUrl = Page2.getBaseFileUri() + "/" + Page2.GCS_BUCKET + "/" + Page2.GCS_JSON_FOLDER + "/" + jsonFilename;
        downloadUrl = encodeURIComponent(downloadUrl);
    
        let uri = "/web/download/" + downloadUrl;
    
        console.log("retrieveResultJson")
        console.log(uri);
    
        $.get(uri, function(response){
            let isJson = false;
            console.log(response)
    
            try
            {
                response = JSON.parse(response);
                isJson = true;
            }
            catch(err)
            {
                isJson = false;
                console.log("Json parse error ")
                //console.log(err);
            }
    
            if( typeof response == 'object')
                isJson = true;
            else
                isJson = false;
            
            //alert(res)
            if(response != null && isJson)
            {
                console.log("here")
                if(callback != null)
                    callback(response)

            }
            else
            {
                if(callbackError != null)
                    callbackError();
            }

        });
    }
    ,
    retrieveJson: function( callback)
    {
        let jsonFilename =  Page2.getJsonFilename(Page2.CUR_PAGE);
        let downloadUrl = Page2.getBaseFileUri() + "/" + Page2.GCS_BUCKET + "/" + Page2.GCS_JSON_FOLDER + "/" + jsonFilename;
        downloadUrl = encodeURIComponent(downloadUrl);
    
        TableResizer.clearTable("divPdfTable")
        let uri = "/web/download/" + downloadUrl;
    
        console.log("retrieveJson")
        console.log(uri);
    
        $.get(uri, function(response){
            let isJson = false;
            console.log(response)
            Page2.tableJson  = response;
    
            try
            {
                response = JSON.parse(response);
                isJson = true;
            }
            catch(err)
            {
                isJson = false;
                console.log("Json parse error ")
                console.log(err);
            }
    
            if( typeof response == 'object')
                isJson = true;
            else
                isJson = false;
            
            
            if(response != null && isJson)
            {
                console.log(response)
                TableResizer.createAllResizedTableByInfo("divPdfTable", response, Page2.onTableCellClick);
                if(callback != null)
                    callback();
            }
            else
            {
                TableResizer.clearTable("divPdfTable");
                if(callback != null)
                    callback();
                //TableResizer.createResizedTable("divPdfTable", 5, 5);
            }
        });
    }
    ,
    autoDetect: function(callback)
    {
        $("#processgif").show();
        Page2.savePDFImage(function(response)
        {
            console.log(response);
            let imageurl = response.payload;
            imageurl = imageurl.replace("gs://", "https://storage.googleapis.com/");
            console.log(imageurl);
            
            let url = "/table/parse/" + encodeURIComponent(imageurl);
            console.log(url);
            $.get(url, function(response){
                console.log(response);

                if(response.success)
                {
                    Page2.resizeTableColumns(response.payload.xBoxes, response.payload.yBoxes)
                    Page2.resizeTableRows(response.payload.xBoxes, response.payload.yBoxes)

                    $("#divPdfTable").css("left", Page2.TABLELEFT)
                    $("#divPdfTable").css("top", Page2.TABLETOP)
                }
                else
                {
                    $.notify("Autodetect fail")
                    TableResizer.createResizedTable("divPdfTable", 7, 10);
                    $("#divPdfTable").css("left", Page2.TABLELEFT)
                    $("#divPdfTable").css("top", Page2.TABLETOP)
                }


                $("#processgif").hide();
            });
            
        });
    }
    ,
    resizeTableColumns: function(xBoxes, yBoxes)
    {
        let rowcount = yBoxes.length;
        let prevItem = null;
        let colWidths = [];
        xBoxes.forEach((item)=>{
            if(prevItem != null)
            {
                colWidths.push( item.boundaryX - prevItem.boundaryX )
            }
            prevItem = item;
        })
        colWidths.push( xBoxes[xBoxes.length - 1].w + 30 );
        console.log(colWidths);
        TableResizer.createResizedTable("divPdfTable", colWidths.length, rowcount);
        TableResizer.resizeColumns("divPdfTable", colWidths);
    }
    ,
    resizeTableRows: function(xBoxes, yBoxes)
    {
        let rowcount = yBoxes.length;
        let prevItem = null;
        let rowHeights = [];
        yBoxes.forEach((item)=>{
            if(prevItem != null)
            {
                rowHeights.push( item.y - prevItem.y - 5)
            }
            prevItem = item;
        })
        //rowHeights.push( items[items.length - 1].w + 30 );
        console.log(rowHeights);
        TableResizer.resizeRows("divPdfTable", rowHeights);
    }
    ,
    getJsonFilename: function()
    {
        let filename = decodeURIComponent(Page2.FILE_URI).split("/");
        filename = filename[filename.length - 1];
        filename = filename.replace(".pdf", ".json");
        let tmpfilename = filename.replace(".json", "");
        tmpfilename += "-page-" + Page2.CUR_PAGE;
        tmpfilename += ".json";
        filename = tmpfilename;

        return filename;
    }
    ,
    getTableInformationOriginal: function(divId)
    {
        let canvasX = $("#pdf-canvas").position().left;
        let canvasY = $("#pdf-canvas").position().top;
    
        console.log("X: " + canvasX + ", Y: " + canvasY)
        //let containerWidth = $("#pdf-main-container").width();
        //canvasX = 11/100 * $(document).width();
    
        let info2 = TableResizer.getTableInformation(divId, { marginLeft: canvasX, marginTop: canvasY});
        return info2;
    
    }
    ,
    saveResult: function(callback)
    {
        let filename = Page2.getResultJsonFilename(Page2.CUR_PAGE);
        let sJson = JSON.stringify(Page2.json);
        Page2.uploadJsonFile(filename, sJson, callback )
    }
    ,
    displayResultJson(json)
    {
        json = JSON.parse(json);
        Page2.json = json;
        $("#json-area").text(JSON.stringify(Page2.json))
        
        let forms = json.form;
        //console.log(forms)
        //alert("here")
        let table = json.table;
        if(forms != null)
        {
            //alert("here 2")
            forms = Page2.createFormIds(forms);
            console.log("FOMRS")
            console.log(forms);
            Page2.displayForm(forms);
        }
            

        if(table != null)
            Page2.displayTableResult(table);
    }
    ,
    saveTable: function(divId, callback)
    {
        if($("#" + divId).html() != "")
        {
    
            //$("#processgif").show();
            console.log("")
            let infos =  TableResizer.getAllTableInformation(divId, {})
            console.log("=====saved infos=====")
            console.log(infos)

            let filename = Page2.getJsonFilename();
            console.log("json filename : " +  filename)
            Page2.uploadJsonFile(filename, infos, function()
            {
                if(callback != null)
                    callback();
                
            })
        }
        else
        {

            let filename = Page2.getJsonFilename();
            Page2.deleteJsonFile(filename, callback);

            //if(callback != null)
            //    callback();
        }
    }
    ,
    
    b64toBlob: function(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;
    
            var byteCharacters = atob(b64Data);
            var byteArrays = [];
    
            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
    
                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
    
                var byteArray = new Uint8Array(byteNumbers);
    
                byteArrays.push(byteArray);
            }
    
          var blob = new Blob(byteArrays, {type: contentType});
          return blob;
    }
    ,
    rowsToBoxes: function(rows)
    {
        let boexes = [];
        rows.forEach((row)=>{
            row.forEach((cell)=>{
                boexes.push({ x: cell.x, y: cell.y, w: cell.width, h: cell.height })
            })
        })
    
        return boexes;
    }
    ,
    downloadResults: function()
    {
        let baseResultFilename = Page2.getResultJsonBaseFilename(Page2.FILE_URI);
        let url  = "/table/download-json-results/" + baseResultFilename + "/" + Page2.PDF.numPages;

        window.open(url)

    }
    ,
    getTemplateFromUI: function(divId)
    {
        let infos =  TableResizer.getAllTableInformation(divId, {})
        console.log("=====saved template=====")
        console.log(infos)
        infos = { imageWidth: Page2.DOCUMENT_WIDTH, imageHeight: Page2.DOCUMENT_HEIGHT, boxes: infos }
        let tableTemplate = JSON.stringify(infos);
        return tableTemplate;
    }
    ,
    saveAsNewTemplate: function(divId, callback, callbackError)
    {

        if($("#" + divId).html() != "")
        {
    
            //$("#processgif").show();

            let url = Page2.LEVENSHTEIN_API + "/templates/create";
      
            let tableTemplate = Page2.getTemplateFromUI(divId);
    
            let template =  {};
            template.title = $("#templateTitle").val();
            template.description = $("#templateDescription").val();
            template.tableTemplate = btoa(tableTemplate);

            let result = Page2.validateTemplate(template);

            if(result.valid)
            {
                $.post(url, JSON.stringify(template), function( response ){
                    if(response.success)
                    {
                        if(callback != null)
                            callback(response.payload);
                    }
                    else 
                    {
                        if(callbackError != null)
                            callbackError({ message: response.message })
                    }
                })
            }
            else
            {
                if(callbackError != null)
                    callbackError({ message: result.message })
            }
        }
        else
        {
            if(callbackError != null)
                callbackError({ message: "No guidelines to save as template!" })
            
        }

    }
    ,
    deleteJsonFile: function(filepath, callback)
    {
        let f = encodeURIComponent(Page2.GCS_JSON_FOLDER + "/" + filepath)
        //var url = Page2.UPLOAD_BASE_URL + "/upload/gcs-public-delete/" + Page2.PROJECT + "/" + Page2.GCS_BUCKET + "/" + f;
        var url = Page2.UPLOAD_BASE_URL + "/gcs/delete?path=" + Page2.PROJECT + ":" + Page2.GCS_BUCKET + "/" + f;

        console.log("delete url");
        console.log(url);
        $.get(url, function(response)
        {
            if(callback != null)
                callback(response);
        })
    }
    ,
    fiednameWindowOriginalPosition: null,
    onTableCellClick: function(cell, tbl)
    {
   
        $("#fieldName").val("");
        $("#fieldNameWindow").show(500, function(){
            $("#fieldName").focus();        
        });

        if($(cell).attr("fieldname") != null)
        {
            $("#fieldName").val($(cell).attr("fieldname"));
        }

        $("#btnOkFieldname").off("click");
        $("#btnOkFieldname").on("click", function(){
            $("#fieldNameWindow").hide(500);
            let fieldnameValue = $("#fieldName").val();

            $(cell).attr("fieldname", fieldnameValue );

            if(fieldnameValue == null || fieldnameValue.length ==  0)
            {
                $(cell).removeAttr("fieldname")
                
            }
            TableResizer.refreshCell(cell)
            

        });

        $("#btnCancelFieldname").off("click");
        $("#btnCancelFieldname").on("click", function(){
            $("#fieldNameWindow").hide(500);
        });

        $("#fieldName").on("keyup", function(event){
            if(event.keyCode == 13)
            {
                $("#btnOkFieldname").click()
            }
        })

    }
    ,
    loadTemplates: function(callback, callbackError)
    {
        $("processgif").show();
        Page2.getAllTemplates(function(response){
            $("processgif").hide();
            if(response.success)
            {
                Page2.displayTemplates(response.payload.rows);
                if(callback != null)
                    callback(response);
            }
            else
            {
                if(callbackError != null)
                    callbackError(response);
            }
        })
    }
    ,
    getAllTemplates: function(callback)
    {
        let url = Page2.LEVENSHTEIN_API +  "/templates";
        $.get(url, function(response){
            if(callback != null)
                callback(response);
        })
    }
    ,
    displayTemplates: function(templates)
    {
        $("#cmb-template").html("");
        let opt = document.createElement("option");
        opt.value = -1;
        $(opt).html("--- Select Template ---");
        $("#cmb-template").append(opt);

        templates.map((template)=>{
            let opt = document.createElement("option");
            opt.value = template.id;
            $(opt).html(template.title);
            $("#cmb-template").append(opt);
        })
    }
    ,
    saveAsTemplate: function(divId, callback)
    {
        let templateId = $('#cmb-template').val();
        
        let tableTemplate = Page2.getTemplateFromUI(divId);
        tableTemplate = btoa(tableTemplate);
        let template = { tableTemplate : tableTemplate };
        Page2.updateTemplate(templateId, JSON.stringify( template), function (response){
            if(callback != null)
                callback(response)
        })
    }
    ,
    updateTemplate: function(id, template, callback)
    {
        let url = Page2.LEVENSHTEIN_API + "/templates/update/" + id;
        $.post(url, template, function(response){
            if(callback != null)
                callback(response);
        })
    }
    ,
    btnSaveTemplateOnClick: function()
    {
    
        $("#processgif").show();
        let templateId = $('#cmb-template').val();

        if(templateId ==  -1)
        {
            alert("Please, select template to update or save as new template!")
        }
        else 
        {
            Page2.saveAsTemplate("divPdfTable", function(response){
                $("#processgif").hide();
                if(response.success)
                {
                    $.notify("Saving template is successful", 'success');
                    Page2.loadTemplates(function(){
                        $('#cmb-template').val(templateId);
                    });
                    
                }
                else
                    $.notify(response.error, 'error')
    
            });

        }

    }
    ,
    btnSaveNewTemplateOnClick: function()
    {
        $("#templateTitle").val("");
        $("#templateDescription").val("");
        $("#templateInfoPopup").show(500);

        $("#btnOkTemplate").off("click" );
        $("#btnOkTemplate").on("click", function(){

            $("#processgif").show();
            Page2.saveAsNewTemplate("divPdfTable", function(newTemplate){
                $("#templateInfoPopup").hide(500);
                Page2.loadTemplates(function(){
                    $("#processgif").hide();
                    $.notify("Template saved!", "success")
                    let templateId = newTemplate.id;
                    $("#cmb-template").val(templateId);
                });

            },
            function(err){
                console.log(err)
                $("#processgif").hide();
                $.notify(err.message, "error")

            })
            

        })
        
        $("#btnCancelTemplate").off("click" );
        $("#btnCancelTemplate").on("click", function(){
            $("#templateInfoPopup").hide(500);

        })
    }
    ,
    validateTemplate: function(template)
    {
        let result = { valid: true };
        if(template.title == null || template.title.length == 0)
        {
            result.valid = false;
            result.message = "Please, specify template title!";
        }

        return result;
    }
    ,
    deleteTemplate: function(id, callback, callbackError)
    {
        let url = Page2.LEVENSHTEIN_API + "/templates/delete/" + id;
        console.log(url)
        $.get(url, function(response){
            console.log('response')
            console.log(response);

            if(response.success)
            {
                if(callback != null)
                    callback(response);

            }
            else
            {
                if(callbackError != null)
                    callbackError(response);
            }
                

        })
    }
    ,
    onBtnDeleteTemplateClick: function()
    {
        let id  = $("#cmb-template").val();
        $("#processgif").show();
        Page2.deleteTemplate(id, function(){
            Page2.loadTemplates(function(){
                $("#processgif").hide();
                $.notify("The template has been removed", 'success')

            })
        }, function(response){
            $("#processgif").hide();
            $.notify(response.error, 'error')
        })
    }
    ,
    getTemplate: function(id, callback, callbackError)
    {
        let url = Page2.LEVENSHTEIN_API + "/templates/get/" + id;
        $.get(url, function(response){
            if(response.success)
            {
                if(callback != null)
                    callback(response.payload);
            }
            else 
            {
                if(callbackError != null)
                    callbackError(response.error);
            }
        })
    }
    ,
    displayTemplate: function(template)
    {
        TableResizer.clearTable("divPdfTable")
        console.log("template")
        console.log(template)
        if(template.templateId != null)
            $("#cmb-template").val(template.templateId);
        else 
            $("#cmb-template").val(template.id);
        $("#cmb-template").select2();
 
        let sTemplate = template.tableTemplate;
        sTemplate = atob(sTemplate);
        let templates =  JSON.parse(sTemplate);
        templates = templates.boxes;
        TableResizer.createAllResizedTableByInfo("divPdfTable", templates, Page2.onTableCellClick);
    }
    ,
    onCmbTemplateChange: function()
    {

        console.log("onCmbTemplateChange")
        let templateid =  $("#cmb-template").val();

        if(templateid == -1)
        {
            TableResizer.clearTable("divPdfTable")
            Page2.getAndDisplayCurrentPageTemplate("divPdfTable")
        }
        else 
        {

            $("#processgif").show();
            Page2.getTemplate(templateid, function(template){
    
                console.log('Template')
                console.log(template)
    
                let tableTemplate = template.tableTemplate;
                tableTemplate = atob(tableTemplate);
                console.log(tableTemplate)
    
                $("#processgif").hide();
                Page2.displayTemplate(template)
    
            }, function( error){
                $("#processgif").hide();
                alert(error)
            })
        }
    }
    ,
    removeSelected: function(divid)
    {
        TableResizer.removeSelectedTable(divid)
    }
    ,
    savePageTemplate: function(divId)
    {

        Page2.getCurrentPageTemplate(function(pageTemplate){

            let pgImgUrl = pageTemplate.pageImageUrl;
            var filename = pgImgUrl.substring(pgImgUrl.lastIndexOf('/')+1);

            Page2.uploadCurrentPageImage(filename, function(response){
                Page2.createUpdateCurrentPageTemplate(response.payload, "divPdfTable")
                Page2.updateDocument();
            })

        }, function(){
            Page2.uploadCurrentPageImage(null, function(response){
                Page2.createUpdateCurrentPageTemplate(response.payload, "divPdfTable")
                Page2.updateDocument();
            })
        })

    }
    ,
    updateDocument: function()
    {
        let fileuri = Page2.FILE_URI;
        fileuri = fileuri.replace("https://storage.googleapis.com/", "gs://")
        let url = Page2.LEVENSHTEIN_API + "/documents/update-date";
        url += "/" + encodeURIComponent(fileuri);

        console.log("update doccument")
        $.get(url, function(response){
            console.log("response")
            console.log(response)
        })
    }
    ,
    createUpdateCurrentPageTemplate: function(fileurl, divId)
    {
        let url = Page2.LEVENSHTEIN_API + "/pagetemplates/create-update";
        fileurl = fileurl.replace("gs://", "https://storage.googleapis.com/")

        let pageTemplate = {};
        pageTemplate.templateId = $("#cmb-template").val();
        pageTemplate.pageImageUrl = fileurl;
        pageTemplate.document = Page2.FILE_URI;
        pageTemplate.page = Page2.CUR_PAGE;
        var pgTableTemplate = JSON.parse(Page2.getTemplateFromUI(divId));
        
        if (localStorage.getItem("flag_row") !== null) {
            pageTemplate.skipRowTable = btoa(localStorage.getItem("flag_row"));
            // x = localStorage.getItem("flag_row");
            // x = JSON.parse(x)
            // for(i=0;i<x.length;i++){
            //     pgTableTemplate.boxes[4].rows.splice(x[i],1);
            // }
            localStorage.removeItem("flag_row");
        }
        pageTemplate.tableTemplate = JSON.stringify(pgTableTemplate);
        console.log("pagerano: "+pageTemplate.tableTemplate);

        pageTemplate.tableTemplate = btoa(pageTemplate.tableTemplate);


        console.log("PageTemplate")
        console.log(pageTemplate)
        
        $("#processgif").show();
        $.post(url, JSON.stringify(pageTemplate), function(response){
            console.log(response)
            if(response.success)
            {
                $.notify("Template for this  page is  saved", "success")

            }
            else {
                $.notify("Error :  " + response.message, "error")
            }
            $("#processgif").hide();
        })
    }
    ,
    makeid (length) 
    {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
       }
       return result;
    }
    ,
    uploadCurrentPageImage(filename, callback, callbackError)
    {

        try 
        {

            document.getElementById("pdf-canvas").toBlob((blob) => {
                let fname = Page2.makeid(10) + ".png"
                if(filename != null)
                    fname = filename;

                let file = new File([blob], fname, { type: "image/png" })
                var formdata = new FormData();
                formdata.append("file", file, fname);
    
                //let uploadUrl = Page2.UPLOAD_URL + "/upload/gcs/" + Page2.PROJECT + "/" + Page2.GCS_UPLOAD_BUCKET + "/" + Page2.GCS_IMAGE_FOLDER;
    
                let uploadUrl = Page2.UPLOAD_URL + "/gcs/upload?path=" + Page2.PROJECT + ":" + Page2.GCS_UPLOAD_BUCKET + "/" + Page2.GCS_IMAGE_FOLDER + "/";


                console.log("uploadUrl")
                console.log(uploadUrl)
                console.log(fname)
    
                $.ajax({
                    url: uploadUrl,
                    type: "POST",
                    data: formdata,
                    processData: false,
                    contentType: false,
                }).catch(function(e){
                    console.log(e)
                })
                .done(function(respond){
                    //alert(respond);
                    console.log("RESPON")
                    console.log(respond)
    
                    if(callback != null)
                        callback(respond)
                });

              }, 'image/png');

        }
        catch (error){
            if(callbackError != callbackError)
                callbackError(error)
        }

    }
    ,
    getAndDisplayCurrentPageTemplate(divId)
    {
        $("#processgif").show();
        Page2.getCurrentPageTemplate(function(pageTemplate){

            console.log("getAndDisplayCurrentPageTemplate")
            console.log(pageTemplate);

            $("#processgif").hide();
            
            //let template = pageTemplate.tableTemplate;
            Page2.displayTemplate(pageTemplate);
        }, function(){
            $("#processgif").hide();
        })

    }
    ,
    getCurrentPageTemplate(callback, callbackError)
    {
        let document = Page2.FILE_URI;
        document = document.replace(/%20/gi, " ");
        document = encodeURIComponent(document)

        let page = Page2.CUR_PAGE;

        let url = Page2.LEVENSHTEIN_API + "/pagetemplates/get-by-document-page/" + document + "/" + page;
        $.get(url, function(response){
            if(response.success)
            {
                if(callback != null)
                    callback(response.payload)
            }
            else 
            {
                if(callbackError != null)
                    callbackError(response)
            }
        })
    }
    ,
    getAllPageTemplatesByDocument(document)
    {
        console.log("getAllPageTemplatesByDocument()")      
        console.log(document)
        let promise = new Promise((resolve, reject)=>{
            let url = Page2.LEVENSHTEIN_API + "/pagetemplates/get-by-document/" + document;
            console.log(url)

            $.get(url, function(response){

                console.log("getAllPageTemplatesByDocument.response")
                console.log(response);

                if(response.success)
                {
                    resolve(response.payload.rows)
                }
                else 
                {
                    reject(response)
                }
            })
        })
        return promise;
    }
    
}