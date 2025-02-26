export class DetailOcrSessionPage
{
    getConfidenceThresholds()
    {
        return [0, 0.70, 0.95, 1]
    }

    getConfidenceColors()
    {
        return ["#ff1111", "#ffff11", "#ffffff"]
    }

    mapConfidence(confidence)
    {
        console.log("mapConfidence")
        console.log(confidence)

        let thresholds = this.getConfidenceThresholds()
        let confidenceColors = this.getConfidenceColors()
        for(var i = 0; i < thresholds.length - 1; i++)
        {
            if(confidence >= thresholds[i] && confidence < thresholds[i+1])
            {
                return confidenceColors[i]
            }
        }

        return null;
    }

    init(config, id, session)
    {
        var me = this;
        this.config = config;
        this.id = id;

        $("li#" + session.activeLink + " > a > p").css("color", "#cc5522")

        $("#btn-rerun-ocr").hide();

        this.initnext(me, function(mem){

            mem.initCmbPage(mem)
            mem.initEvents(mem);
        })
        
    }   

    initnext(me, callback)
    {
        me.getSession(me.id, { success: function(session){
            me.ocrSession = session;
            console.log('getsession done')

            me.ocrSession.sessionStartDateDisplay = moment(me.ocrSession.sessionStartDate).format('DD-MM-YYYY HH:mm:ss')
            me.ocrSession.sessionEndDateDisplay = moment(me.ocrSession.sessionEndDate).format('DD-MM-YYYY HH:mm:ss')


            let ocrResults = me.ocrSession.ocrResult;
            //console.log(ocrResults)
            ocrResults = Base64.decode(ocrResults);
            ocrResults = JSON.parse(ocrResults)
            

            me.ocrResults = ocrResults;
        
            me.displayOcrSession(me, session)

            if(callback != null)
                callback(me)


        }, error: null });
    }

    initCmbPage(me)
    {
        let cmb = $("#cmb-page")        
        $(cmb).html("")
        let totalPage  = me.getTotalPages(me);
        let pages = me.getPages(me);

        for(let i = 0; i < pages.length; i++)
        {
            let opt = document.createElement("option")
            $(opt).attr("value", pages[i])
            $(opt).html(pages[i])

            $(cmb).append(opt)
        }
    }

    initEvents(me)
    {
        $("input[name='displayType']").off("click")
        $("input[name='displayType']").on("click", function(){
            me.onChangeEvent(me)
        });

        //$("#cmb-page").off("change")
        $("#cmb-page").on("change", function(){
            me.onChangeEvent(me)
        });

        $("#btn-save-changes").off("click")
        $("#btn-save-changes").on("click", function(){
            me.saveChanges(me)
        });

        $("#btn-download-result").off("click")
        $("#btn-download-result").on("click", function(){
            me.downloadOcrResult(me)
        });

        $("#btn-cancel-session").off("click")
        $("#btn-cancel-session").on("click", function(){
            location = "/ocrsessions"
        });

        $("#btn-sc-edit-template").on("click", function(){
            var page = $("#cmb-page").val();
            var doc = $("#document").text();
            var doc = doc.replace("https://storage.googleapis.com/lv-tennant-spindo-upload-bucket/pdf/","")            
            console.log(doc)
            var id;
            const searchParams = new URLSearchParams(window.location.search);
            if(searchParams.has('id')){
                for (const param of searchParams) {
                    id = param[1];
                }
            }
            location = "/documents?id="+id+"&page="+page+"&doc="+doc;
        });

        $("#btn-rerun-ocr").off("click")
        $("#btn-rerun-ocr").on("click", function(){
            me.reRunOcr(me)
        });
        
        $("input[name='displayType']").each(function(item){
            let type = $(this).val();

            if(type == "form")
            {
                $(this).prop("checked" , true)
                $(this).click();
            }
        })
    }

    onChangeEvent(me)
    {
        let displayType = $("input[name='displayType']:checked").val();
        let page = $("#cmb-page").val();
        
        me.displayResult(me, displayType, page);
    }

    saveChanges(me)
    {
        console.log(me.ocrResults)

        let ocrResults = Base64.encode(JSON.stringify(me.ocrResults))
        me.ocrSession.ocrResult = ocrResults;

        console.log(me.ocrSession)


        
        let id = me.ocrSession.id;
        let url = this.config.LEVENSHTEIN_API + "/ocrsessions/update/" + id;
        console.log('ocrsession update ' + url)
        console.log(me.ocrSession)
        $.post(url, JSON.stringify(me.ocrSession), function (response){

            console.log("RESPONSE from " + url)
            console.log(response)

            if(response.success)
            {
                $.notify("Changes are saved", "success")
            }
            else 
            {
                $.notify("Error " + response.message, "error")
            }
        })
        
    }

    reRunOcr(me)
    {
        let sessionID = me.ocrSession.sessionID;
        let page = $("#cmb-page").val();
        let url = me.config.LEVENSHTEIN_API + "/ocrsessions/run-ocr-session/" + sessionID + "/" + page;
        $("#processgif").show();
        console.log('rerunocr')
        console.log(url)
        $.get(url, function(response){
            console.log("rerunocr response")
            console.log(response)
            if(response.success)
            {
                setTimeout(function(){
                    $.notify("OCR is successful", "success")
                    me.initnext(me, function(){
                        me.onChangeEvent(me)
                    })
                }, 1000)

            }
            else 
            {
                $.notify("Error " + response.message, "error")
            }
            $("#processgif").hide(); 
        } )


    }

    getTotalPages(me)
    {
        console.log("me.ocrSession")
        console.log(me.ocrSession)
        let ocrResults = me.ocrSession.ocrResult;
        ocrResults = Base64.decode(ocrResults);
        ocrResults = JSON.parse(ocrResults)
        return ocrResults.length;
    }

    getPages(me)
    {
        console.log("me.getPages")
        console.log(me.ocrSession)
        let pages = [];
        let ocrResults = me.ocrSession.ocrResult;
        ocrResults = Base64.decode(ocrResults);
        ocrResults = JSON.parse(ocrResults)
        for(let i = 0; i < ocrResults.length; i++)
        {
            let ocrRes = ocrResults[i];
            pages.push(ocrRes.page)
        }
        return pages;
    }

    getSession (id, callback)
    {
        let me = this;
        let url = this.config.LEVENSHTEIN_API + "/ocrsessions/get/" + id;
        console.log(url)
        $.get(url, function(result){
            let data = result.payload;
            console.log(data)
            if(result.success )
            {
                me.ocrSession = data;
                if(callback != null && callback.success != null)
                    callback.success(data);
            }
            else
            {
                if(callback != null && callback.error != null)
                    callback.error(result);
            }
        })
    }

    displayOcrSession(me, session)
    {
        $("#sessionID").html(session.sessionID)
        $("#sessionStartDate").html(session.sessionStartDateDisplay)
        $("#sessionEndDate").html(session.sessionEndDateDisplay)
        $("#runningStatus").html(runningStatus)
        $("#document").html(session.document)
        $("#runningStatus").html(me.getSessionStatusName(session.runningStatus));

    }

    getSessionStatusName(status)
    {
        switch (status)
        {
            case 0:
                return "Not Started";
            case 1: 
                return "Running...";
            case 2:
                return "Finish";
            case 3:
                return "Fail";
        }
    }


    displayResult(me, displayType, page)
    {
        $("#viewOcrResult").html("");
        if(displayType == "form")
        {
            let tbl = me.createFormDisplay(me, page)
            $("#viewOcrResult").append(tbl)
            HudaTableEditor.apply(tbl, 
                function(values, [row,col], newValue, td, tbl)
                { 
                    me.onTableChange(me, values, [row,col], newValue, td, tbl) 
                
                }
                , null, [0])
        }
        else {
            let tables = me.createTableDisplay(me, page);
            tables.map((tbl)=>{ 
                $("#viewOcrResult").append(tbl)
                $("#viewOcrResult").append("<div style='height: 50px'></div>")
                HudaTableEditor.apply(tbl, 
                function(values, [row,col], newValue, td, tbl)
                { 

                    me.onTableChange(me, values, [row,col], newValue, td, tbl) 
                
                } , null, [], [0])
            })
        }
    }

    onTableChange(me, values, [row,col], newValue, td, tbl)
    {
        console.log("Table values")
        //console.log(values)
        console.log("row : " + row +", col : " + col);
        console.log(newValue);

        let fieldname = $(td).attr("fieldname");
        console.log(fieldname)

        let type = $(tbl).attr("type");

        if(type == "form")
            me.changeFormResult(me, fieldname, newValue)
        else 
            me.changeTableResult(me, tbl, row, col, newValue)
    }

    getOcrResultByPage(me, page)
    {

        console.log("me.ocrResults")
        console.log(me.ocrResults)

        let result = null;
        me.ocrResults.map((ocrResult)=>{
            if(ocrResult.page == page)
                result = ocrResult;
        })
        return result;
    }

    createFormDisplay(me, page)
    {
        let ocrResult = me.getOcrResultByPage(me, page)
        console.log("createFormDisplay.ocrResult")
        console.log(ocrResult)
        let formOcrResult = null;
        try{
            formOcrResult = ocrResult.allResults.formOcrResult.positions;
            $("#result-image").attr("target","_blank");
            $("#result-image").attr("class","btn btn-small btn-primary");
            $("#result-image").attr("href", ocrResult.allResults.formOcrResult.image);
            $("#result-image").html("View Visualization");

        }
        catch(e)
        {

        }

        console.log(formOcrResult)

        if(formOcrResult == null)
        {
            $("#btn-rerun-ocr").show()
            return null;
        }
        else 
        {
            $("#btn-rerun-ocr").hide()

            let tbl = document.createElement("table");
            $(tbl).attr("style", "width: 100%; border: solid 1px #ccc");
            $(tbl).attr("type", "form")
    
            formOcrResult.map((result)=>{
    
                let tr = document.createElement("tr");
                
                let td = document.createElement("td");
                $(td).attr("style", "border: solid 1px #ccc;")
                $(td).attr("fieldname", result.fieldname)
                $(td).html(result.fieldname);
    
                let td2 = document.createElement("td");
                let color = me.mapConfidence(result.confidence)
                $(td2).attr("style", "border: solid 1px #ccc;background-color: " + color)


                $(td2).attr("fieldname", result.fieldname)
                $(td2).html(result.text);
    
                $(tr).append(td);
                $(tr).append(td2);
                $(tbl).append(tr);
                
            })
    
            console.log(tbl);
    
            return tbl;
        }



    }


    createTableDisplay(me, page)
    {

        let tables = [];
        let ocrResult = me.getOcrResultByPage(me, page)

        let tableOcrResult = ocrResult.allResults.tableOcrResult;

        $("#result-image").html("")

        console.log(tableOcrResult)

        if(tableOcrResult != null && tableOcrResult.length > 0)
        {
            $("#btn-rerun-ocr").hide()
        }
        else 
        {
            $("#btn-rerun-ocr").show()
        }

        
        tableOcrResult.map((tableResult)=>{

            if(tableResult.result != null)
            {
                let tbl = document.createElement("table");
                $(tbl).attr("style", "width: 100%; border: solid 1px #ccc");
                $(tbl).attr("id", tableResult.tableID)
                $(tbl).attr("type", "table")

                let rows = tableResult.result.positions;
                let img = tableResult.result.image;

                $("#result-image").append("<a target='_blank' href='" + img  + "'>View visualization</a>")

                let firstRow = rows[0];
                console.log("firstRow")
                console.log(firstRow)

                let tr = document.createElement("tr");
                //create table header
                firstRow.map((cell)=>{
                    let td = document.createElement("td");
                    $(td).attr("style", "border: solid 1px #ccc; font-weight: bold")
                    $(td).attr("fieldname", cell.fieldname)
                    $(td).html(cell.fieldname);
                    $(tr).append(td);
                })

                $(tbl).append(tr);

                //Create table content
                rows.map((row)=>{

                    let tr = document.createElement("tr");
                    row.map((cell)=>{

                        let td = document.createElement("td");
                        let color = me.mapConfidence(cell.confidence)
                        $(td).attr("style", "border: solid 1px #ccc;background-color: " + color)


                        $(td).attr("fieldname", cell.fieldname)
                        $(td).html(cell.text);
                        $(tr).append(td);
                    })
                    $(tbl).append(tr);
                })

                tables.push(tbl)
                $("#btn-rerun-ocr").hide()
            }
            else 
            {

                $("#btn-rerun-ocr").show()
                
            }
        })


        return tables;
    }

    changeFormResult(me, fieldname, value)
    {
        let page  = $("#cmb-page").val();
        let ocrResult = me.getOcrResultByPage(me, page)
        console.log("ocrResult")
        console.log(ocrResult)
        let formOcrResult = ocrResult.allResults.formOcrResult;

        formOcrResult.positions.map((form)=>{
            if(form.fieldname == fieldname)
            {
                form.text = value;
            }
        })

        console.log("change formocrresult")
        console.log(me.ocrResults)
    }

    changeTableResult(me, tbl, row, col, value)
    {
        let tableID = $(tbl).attr("id");
        let page  = $("#cmb-page").val();
        let ocrResult = me.getOcrResultByPage(me, page)
        let tableOcrResult = ocrResult.allResults.tableOcrResult;

        let roworiginal = row - 1;

        if(roworiginal > -1)
        {
            tableOcrResult.map((tableResult)=>{
                if(tableResult.tableID == tableID)
                {
                    tableResult.result.positions[roworiginal][col].text = value;
                }
            })

        }


        console.log("change table ocr result")
        console.log(me.ocrResults)
    }

    downloadOcrResult(me)
    {
        let  id = me.ocrSession.id;
        let url = this.config.LEVENSHTEIN_API + "/ocrsessions/download-ocr-result/" + id;

        console.log("url");
        console.log(url);

        $("#processgif").show();
        $.get(url, function(response){
            console.log("response")
            console.log(response)
            let downloadProject = response.payload.project;
            let downloadBucket = response.payload.bucket;
            let downloadPath = response.payload.path;

            me.interval = setInterval(function()
            {
                me.checkAndDownloadOcrResult(me, downloadProject, downloadBucket, downloadPath)
            }, 5000)


        } )
        //window.open(url);
    }

    checkAndDownloadOcrResult(me, downloadProject, downloadBucket, downloadPath)
    {


        //let url =  me.config.UPLOAD_URL + "/upload/gcs/download-file/" + me.config.PROJECT + "/" + me.config.GCS_UPLOAD_BUCKET + "/" +  filepath
        let url =  me.config.UPLOAD_URL + "/gcs/download?path=" + 
        downloadProject + ":" + downloadBucket + "/" +  downloadPath;

        console.log("checkAndDownloadOcrResult().url : " + url)
        $.get(url, function(response){
            console.log('checkAndDownloadOcrResult().response')
            //console.log(response)
            if(response.success != false)
            {
                $("#processgif").hide();
                clearInterval(me.interval)
                window.open(url, "__blank")
            }
        })
    }

}