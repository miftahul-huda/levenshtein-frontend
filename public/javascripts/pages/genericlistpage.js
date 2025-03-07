export class GenericListPage {
    
    constructor(){
        this.offset = 0;
        this.totalData = 0;
        this.limit  =  10;
        this.table = null;

    }

    getApiScript()
    {
        return "/javascripts/pages/api/documentApi.js";
    }

    getTableId()
    {
        return "documentlist";
    }

    init(config, session)
    {
        var me  = this;
        me.config = config;
        me.session = session;

        GLOBAL.session.user = {
            email: session.email,
            name: session.name,
            userRole: session.role,
            lastLogin: session.lastLogin
        }
        
        console.log("me.session")
        console.log(me.session)


        $(document.body).off("mouseover");
        $(document.body).on("mouseover", function(){
            //console.log("onmouseover")
            GLOBAL.session.lastLogin = new Date( Date.now());
            //console.log(GLOBAL.session.lastLogin)
        })

        GLOBAL.CHECKIDLEON = true;
        setInterval(GLOBAL.checkIdle, 1000);

        let scrpt = me.getApiScript();

        //$("li#" + me.session.activeLink + " a").removeClass("nav-link")
        $("li#" + me.session.activeLink + " > a > p").css("color", "#cc5522")


        console.log($("li#" + me.session.activeLink + " a"))
        //$("li[id='" + session.activeLink + "'] a").css("color", "#006699")

        $.getScript(scrpt[0], 
            function() {
                eval("me.api = " + scrpt[1]);
                me.api.config = me.config;
                me.api.session = me.session;
                me.loadData(me,  { success: function(payload){ me.loadDataSuccess(me, payload) }, error: null} )
                me.initControls();
            }
        );
    }

    getColumns()
    {
        return [];
    }

    initRows(rows)
    {
        return rows;
    }
    
    loadDataSuccess (me, payload)
    {
        $("#processgif").hide();
        if(me.table != null)
            me.table.destroy();

        let rows = payload.rows;
        for(var i = 0; i < rows.length; i++)
        {
            rows[i].no = i + 1;
            rows[i].delete = "<div class='row-delete-button' data='" + rows[i].id + "' style='cursor: pointer' onclick=''>x</div>"
        }

        rows = me.initRows(rows);

        console.log("rows");
        console.log(rows);

        let cols = me.getColumns();
        cols.push({ data: "delete"})

        me.table = $('#' + me.getTableId()).DataTable( {
            data: rows,
            columns: cols,
            paging: false,
            searching: false
        });

        me.totalData = payload.count;
        let totalPage = Math.floor( me.totalData / me.limit)  + 1;
        me.createPaginationButtons(totalPage);
        
        $("select.limitselect").unbind("change");
        $("select.limitselect").val(me.limit);
        $("a[data-dt-idx]").on("click",function(){
            let page = $(this).text();
            console.log(page)
            me.offset = (page - 1) * me.limit;
            me.loadData(me,  { success: function(payload){ me.loadDataSuccess(me, payload) }, error: null} );
        })

        $("select.limitselect").on("change", function(){
            //console.log($(this).val())
            me.offset = 0;
            me.loadData(me,  { success: function(payload){ me.loadDataSuccess(me, payload) }, error: null} );
        });

        $(".row-delete-button").off("click");
        $(".row-delete-button").on("click", function(){
            let id = $(this).attr('data');
            me.deleteData(me, id)
        })

        me.initEvents();
    }

    initEvents()
    {
        
    }
    
    createPaginationButtons(total)
    {
        $("div.dataTables_paginate > span").html("");
        for(var i = 0; i < total; i++)
        {
            let num = i + 1;
            let btn = "<a class=\"paginate_button current\"  data-dt-idx=\"" + num + "\" tabindex=\"" + i + "\">" + num + "</a>";
            $("div.dataTables_paginate > span").append(btn);
        }
    }
    
    initControls()
    {
        $("#btn-upload").click(function() {
            location = "/documents/upload";  
        })

        
    }
    
    loadData(me, callback)
    {
        let search = $("input[type=search").val();
        let offset = me.offset;
        let limit = $("select.limitselect").val();
        if(limit == null)
            limit  = 10;
        
        console.log("limit : " +  limit)
        me.limit = limit;

        $("#processgif").show();
        me.api.findAll(offset, me.limit, callback);
    }

    deleteData(me, id)
    {
        $("#processgif").show();
        me.api.delete(id, { success: function(){
            me.loadData(me,  { success: function(payload){ me.loadDataSuccess(me, payload) }, error: null} )
            me.initControls();
            $("#processgif").hide();
        }, error: null  })
    }
}