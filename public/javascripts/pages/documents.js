import { GenericListPage } from "./genericlistpage.js";

export class DocumentPage extends GenericListPage
{

    getApiScript()
    {
        return ["/javascripts/pages/api/documentApi.js", "documentApi"];
    }

    getTableId()
    {
        return "documentlist";
    }

    initRows(rows)
    {
        let me = this;
        let removeIndexes = [];
        for (var i =0; i < rows.length; i++)
        {
            if(me.session.role.indexOf("ADMIN") == -1 && rows[i].upload_by != me.session.email)
            {
                removeIndexes.push(i);
            }
            rows[i].createTemplate = "<div class='row-menu row-create-template' data='" + rows[i].filename + "'>Create Template</div>"
            rows[i].process = "<div class='row-menu row-ocr'  data='" + rows[i].id + "'>OCR</div>"
            console.log('initrows')
            rows[i].upload_date = moment(rows[i].upload_date).format("DD-MM-YYYY HH:mm:ss")
            rows[i].updatedAt = moment(rows[i].updatedAt).format("DD-MM-YYYY HH:mm:ss")
        }

        removeIndexes.map((idx)=>{
            rows.splice(idx, 1);
        })
        return rows;
    }

    initEvents()
    {
        
        var me = this;

        var docname;
        var docid;
        const searchParams = new URLSearchParams(window.location.search);
        if(searchParams.has('doc') && searchParams.has('id')){
            for (const param of searchParams) {
                if(param[0]=="id") docid = param[1];
                if(param[0]=="doc") docname = param[1];
            }
            var url = "gs://lv-tennant-spindo-upload-bucket/pdf/"+docname;
            me.onCreateTemplateClick(url)
        }

        console.log("docname: "+docname)
        console.log("docid: "+docid)

        $(".row-create-template").on('click', function(){
            let data = $(this).attr("data")
            me.onCreateTemplateClick(data)
        } )

        $(".row-ocr").on('click', function(){
            let data = $(this).attr("data")
            me.onOcrClick(data)
        } )

        $("#btn-close-new-template").on('click', function(){
            localStorage.removeItem("flag_row");
            $("#newTemplate").hide(500);
            if(docname!=null && docid!=null){
                location = "/ocrsessions/view?id=" + docid;
            }else{
                me.loadData(me,  { success: function(payload){ me.loadDataSuccess(me, payload) }, error: null} )
            }
        })
    }

    getColumns()
    {
        return [
            { data: 'no' },
                { data: 'filename'},
                { data: 'upload_date' },
                { data: 'updatedAt' },
                { data: 'upload_by' },
                { data: 'createTemplate' },
                { data: 'process' }
        ]
    }

    onCreateTemplateClick(uri)
    {
        var pageid=1;
        const searchParams = new URLSearchParams(window.location.search);
        if(searchParams.has('page')){
            for (const param of searchParams) {
                if(param[0]=="page") pageid = param[1];
            }
        }
        console.log("pagenumm: "+pageid);

        $("#newTemplate").show(100);
        $("#newTemplateFrame")[0].src = "/templates/new?uri=" + encodeURIComponent(uri) +"&curpage="+pageid;

        //window.open("/templates/new?uri=" + encodeURIComponent(uri), "","height=200,width=400,scrollbars=no")
    }

    onOcrClick(idDocument)
    {
        location = "/ocrsessions/add?documentid=" + encodeURIComponent(idDocument);
    }
}