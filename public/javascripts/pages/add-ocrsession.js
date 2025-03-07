export class AddOcrSessionPage
{
    init(config, documentid, session)
    {
        var me = this;
        this.config = config;
        this.documentid = documentid;
        this.session = session;

        $("li#" + session.activeLink + " > a > p").css("color", "#cc5522")


        me.getDocumentById(documentid).then((document)=>{
            me.document = document.filename.replace("gs://", "https://storage.googleapis.com/");

            let a = "<a target='__blank' href='" + me.document + "'>" + me.document + "</a>"
            $("#document").html(a)
        })
        
        $("#btn-start-ocr").on("click", function(){
            me.onStartButtonClick(me.document);
        })

        $("#btn-cancel-ocr").on("click", function(){
            location = "/documents"
        })

        $("#processgif").show();
        me.getTemplates({
            success: function(templates)
            {
                me.displayTemplates(templates);
                $("#processgif").hide();
            }
        })

        $(document.body).off("mouseover");
        $(document.body).on("mouseover", function(){
            //console.log("onmouseover")
            GLOBAL.session.lastLogin = new Date( Date.now());
            //console.log(GLOBAL.session.lastLogin)
        })

        GLOBAL.CHECKIDLEON = true;
        setInterval(GLOBAL.checkIdle, 1000);
    }

    getDocumentById(id)
    {
        let promise = new Promise((resolve, reject)=>{

            let url = this.config.LEVENSHTEIN_API + "/documents/get/" + id;
            $.get(url, function(response){
                if(response.success)
                {
                    resolve(response.payload)
                }
                else 
                {
                    reject(response.error);
                }
            })
        })

        return promise;
    }

    getTemplates (callback)
    {
        let url = this.config.LEVENSHTEIN_API + "/templates";
        console.log(url)
        $.get(url, function(result){
            let data = result.payload;
            console.log(data)
            if(result.success )
            {
                if(callback != null && callback.success != null)
                    callback.success(data.rows);
            }
            else
            {
                if(callback != null && callback.error != null)
                    callback.error(result);
            }
        })
    }

    displayTemplates(templates)
    {
        $("#cmb-template").html("")
        templates.map((template)=>{
            let opt =  document.createElement("option")
            opt.value = template.id;
            $(opt).html(template.title);
            $("#cmb-template").append(opt)
        })
    }

    onStartButtonClick(filepath)
    {
        $("#processgif").show()
        let file = this.assembleOcrSession(filepath);

        let result = this.validateOcrSession(file);

        if(result.valid)
        {
            this.saveOcrSession(file).then((response)=>{
                console.log("OCR Session saving response")
                console.log(response);
                this.runOcrSessions(this, function (){
                    $("#processgif").hide()
                    location = "/ocrsessions"
                })                
                
            }).catch((e)=>{
                console.log("error")
                console.log(e)
                $("#processgif").hide()
            })

        }
        else 
        {
            $("#processgif").hide()
            alert(result.message)
        }

    }

    onAllFileUploaded()
    {
        location = "/documents"
    }

    assembleOcrSession(filepath)
    {
        let ocrSession = {
            document: filepath,
            sessionStartDate : Date.now(),
            runningStatus : 0,
            executedBy: this.session.email   
        }

        return ocrSession;
    }

    async saveOcrSession(ocrSession)
    {
        let me = this;
        let promise = new Promise((resolve, reject)=>{
            let levApi = me.config.LEVENSHTEIN_API;
            let url = levApi + "/ocrsessions/create";
            console.log(url)
            console.log(ocrSession);
            $.post(url, JSON.stringify(ocrSession), function (response){
                if(response.success)
                {
                    resolve(response)
                }
                else
                {
                    reject(response)
                }
            })
        })
        return promise;   
    }

    validateOcrSession(ocrSession)
    {
        if(ocrSession.document == null)
            return { valid: false, message: 'Please, select document'}

        return { valid: true}
    }

    runOcrSessions(me, callback)
    {
        let url = me.config.LEVENSHTEIN_API + "/ocrsessions/run-ocr-sessions";
        $.get(url, function (response){
            if(callback!=null)
                callback(response);
        })
    }
}