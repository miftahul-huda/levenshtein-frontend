var TableResizer = {
    DRAG: false,
    tables: [],
    clear: function(divId)
    {
        $("#" + divId).html("");
        TableResizer.tables = [];
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
    createTable: function(divId, colNum, rowNum, header=true, tableId=null, onCellClick=null)
    {
        var tbl = document.createElement("table");
        if(tableId == null)
            $(tbl).attr("id", divId + "-table-" + TableResizer.makeid(6));
        else 
            $(tbl).attr("id", tableId);

        $(tbl).addClass("tbl-pdf");


        if(header)
        {
            var tr = document.createElement("tr");
            $(tr).attr("row-idx", -1);

            for(var i = 0; i < colNum; i++)
            {
                var th = document.createElement("th");
                $(th).attr("col-idx",  i);
                $(th).attr("row-idx",  -1);
                $(tr).append(th);
            }
            $(tbl).append(tr);
        }

        for(var i = 0; i < rowNum; i++)
        {
            var tr = document.createElement("tr");
            $(tr).attr("row-idx" , i);
            for(var j = 0; j < colNum; j++)
            {
                var td = document.createElement("td");
                $(td).attr("row-idx",  i);
                $(td).attr("col-idx",  j);
                $(tr).append(td);
            }
            $(tbl).append(tr);
        }

        return tbl;
    }
    ,
    resizeColumns: function(divId, colWidths)
    {
        var table = $("#" + divId).find("table")[0];
        for(var i = 0; i < colWidths.length; i++)
        {
            $(table).find("th[col-idx="  + i + "]").width(colWidths[i]);
            $(table).find("td[col-idx="  + i + "]").width(colWidths[i]);
        }

        $("th[col-idx]").each(function(){
            let posx = parseFloat($(this).position().left);
            let ww = parseFloat($(this).width());
            $(this).find(".coladddel-container").css("position", "absolute");
            $(this).find(".coladddel-container").css("left", posx + (ww - 0));
        });
    }
    ,
    resizeRows: function(divId, rowHeights)
    {
        var table = $("#" + divId).find("table")[0];
        for(var i = 0; i < rowHeights.length; i++)
        {
            $(table).find("td[row-idx="  + i + "]").height(rowHeights[i]);
        }
    }
    ,
    flagRow: function(tbl, idx)
    {

        console.log("zoom-flag: "+idx);
        $(tbl).find("tr[row-idx=" + idx + "] td").html("<span class='text-warning'>x</span>");
        
        if (localStorage.getItem("flag_row") === null) {
            x = [];
            x.push(idx)
            x = JSON.stringify(x);
            localStorage.setItem("flag_row", x);
        }else{
            x = localStorage.getItem("flag_row");
            x = JSON.parse(x)
            x.push(idx)
            x = JSON.stringify(x);
            localStorage.setItem("flag_row", x);
            
            // console.log("zoom-ls: "+localStorage.getItem("flag_row"));
        }
        // arr["boxes"][4]["rows"][x]
        // arr["boxes"][4]["rows"][5] //data ke 6
        // arr["boxes"][4]["rows"][12] //data ke 13
        // x = JSON.parse(Page2.getTemplateFromUI("divPdfTable"));
        // x.boxes[4].rows.splice(12,1);
        // x.boxes[4].rows.splice(5,1);
        // console.log("zoom-o: "+ JSON.stringify(x));
    }
    ,
    setAllIdx: function(tbl)
    {
        let prevIdx = -1;
        var rowIdx = -1;
        var colIdx = 0;
        $(tbl).find("tr").each(function(rowindex) {
    
            if(rowindex == 0)
            {
                $(this).attr("row-idx", rowIdx);
            }
            colIdx = 0;
            $(this).find("th").each(function(tdindex){    
                $(this).attr("row-idx", rowIdx);
                $(this).attr("col-idx", colIdx);
                colIdx++;
            })
        });

        rowIdx = 0;
        $(tbl).find("tr").each(function(rowindex) {
    
            if(rowindex > 0)
            {
                $(this).attr("row-idx", rowIdx - 1);
            }
            colIdx = 0;
            $(this).find("td").each(function(tdindex){    
                $(this).attr("row-idx", rowIdx);
                $(this).attr("col-idx", colIdx);
                colIdx++;
            })
            rowIdx++;
        });
    
    }
    ,
    addCol: function(tbl, idx)
    {
        //Create new TH
        var th = document.createElement("th");
        $(th).attr("col-idx",  parseInt(idx) +1);
        $(th).attr("row-idx",  -1);
        $(th).append(TableResizer.getThContent());

        //Insert new TH into header
        $(tbl).find("th[col-idx=" + idx + "]").after(th);
    
    
        //Create new TD 
        var td = document.createElement("td");
        $(td).append(TableResizer.getTdContent());
        $(td).attr("col-idx",  parseInt(idx)+1);

        //Insert new TD into rows
        $(tbl).find("td[col-idx=" + idx + "]").after(td);
    
        //Set all indexes
        TableResizer.setAllIdx(tbl);

        TableResizer.setLastTdContent(tbl);
        TableResizer.initTableEvents(tbl);
        
    }
    ,
    delCol: function(tbl, idx)
    {
        $(tbl).find("[col-idx=" + idx + "]").remove();
        TableResizer.setAllIdx(tbl)
        TableResizer.setLastTdContent(tbl);
        TableResizer.initTableEvents(tbl);
    }
    ,
    addRow: function(tbl, idx)
    {
        //Create new TR with initialized TDs
        var tr = document.createElement("tr");
        let totalCols = $(tbl).find("th").length;

        let h = 30;
        if(idx == -1)
        {
            h = 30;
        }
        else
        {
            h = $(tbl).find("tr[row-idx=" + idx + "]").css("height");
        }

        for(var i = 0; i < totalCols; i++)
        {
            var td = document.createElement("td");
            $(td).css("height", h);
            $(td).append(TableResizer.getTdContent());
            $(tr).append(td);
        }
    
        //Insert into table
        if(idx == -1)
            $(tbl).find("tr[row-idx=-1]").after(tr);
        else
            $(tbl).find("tr[row-idx=" + idx + "]").after(tr);
    

        //Set all indexes
        TableResizer.setAllIdx(tbl);
        
        TableResizer.setLastTdContent(tbl);
        TableResizer.initTableEvents(tbl);
        
    }
    ,
    delRow: function(tbl, idx)
    {
        if(idx == -1)
            $(tbl).find("tr[row-idx=-1]").remove();
        else
            $(tbl).find("tr[row-idx=" + idx + "]").remove();
    
        //Set all indexes
        TableResizer.setAllIdx(tbl);

        TableResizer.setLastTdContent(tbl);
        TableResizer.initTableEvents(tbl);
        
    }
    ,
    getThContent: function()
    {
        let btnAdd = "<div class=\"coladd\"></div> ";
        let btnDel = "<div class=\"coldel\"></div> ";
        let divBtn = "<div class='coladddel-container'>" + btnAdd + btnDel + "</div>";
    
        let thContent = divBtn +
                        "<div class='th-dragger-container'> " +
                            "<div class='dragger-column-container'> " +
                                "<div class=\"dragger-column\"></div> " +
                            "</div> " +
                            "<div class='dragger-row-container'> " +
                                "<div class=\"dragger-row\"></div> " +
                            "</div> " +
                        "</div>";
    
        return thContent;
    }
    ,
    getThLastContent: function()
    {
        
        let btnRowAdd = "<div class=\"rowadd\"></div> ";
        let btnRowDel = "<div class=\"rowdel\"></div> ";
        let btnRowFlag = "<div class=\"rowflag\"></div> ";
        let divbtnRow = "<div class='rowadddel-container'>" + btnRowAdd + btnRowFlag + "</div>"
    
        let btnAdd = "<div class=\"coladd\"></div> ";
        let btnDel = "<div class=\"coldel\"></div> ";
        let divBtnCol = "<div class='coladddel-container'>" + btnAdd + btnDel + "</div>";
    
        let thDragger = "<div class='th-dragger-container'> " +
                            "<div class='dragger-column-container'> " +
                                "<div class=\"dragger-column\"></div> " +
                            "</div> " +
                            "<div class='dragger-row-container'> " +
                                "<div class=\"dragger-row\"></div> " +
                            "</div> " +
                        "</div>";
        let thContent = "<div class='th-last'><div class='th-last-button-dragger'>" + divBtnCol + thDragger + "</div>" + divbtnRow + "</div>"
                            
        return thContent;
    }
    ,
    getTdContent: function()
    {
        let thDragger = "<div class='th-dragger-container'> " +
                            "<div class='dragger-column-container'> " +
                                "<div class=\"dragger-column\"></div> " +
                            "</div> " +
                            "<div class='dragger-row-container'> " +
                                "<div class=\"dragger-row\"></div> " +
                            "</div> " +
                        "</div>";
    
        return thDragger;
    }
    ,
    setLastTdContent: function(tbl)
    {
        let totalCols = $(tbl).find("th").length;
    
        $(tbl).find("div[class=rowadd]").remove();
        $(tbl).find("tr").each(function(rowIdx){
            let td = null;
            let iii = 0;
            $(this).find("td").each( function(colIdx){
    
                if(colIdx == totalCols - 1)
                    td = $(this);
    
            })
            if($(td).find("[class='rowadd'").length == 0)
            {
                let tdContent = $(td).html();
                
                let btnRowAdd = "<div class=\"rowadd\"></div> ";
                let btnRowDel = "<div class=\"rowdel\"></div> ";
                let btnRowFlag = "<div class=\"rowflag\"></div> ";
                let divbtnRow = "<div class='rowadddel-container'>" + btnRowAdd + btnRowDel + btnRowFlag + "</div>"            
                let newTdContent = "<div class='th-last'><div class='th-last-button-dragger'>" + tdContent + "</div>" + divbtnRow + "</div>"
    
                $(td).html(newTdContent)
            }
        })
    
        var td = null;
        $(tbl).find("th").each(function(){
            td = $(this);
        })
    
        $(td).html(TableResizer.getThLastContent());
        TableResizer.refreshCell(td);   
    
    }
    ,
    initTableEvents: function(tbl)
    {
        var pressedcol = false;
        var pressedrow = false;
        var start = undefined;
        var startX, startWidth;
        var startY, startHeight;
    
        var tblId = tbl.id;
        var divId = $(tbl).parent().attr("id");
        
    
        $("#" + tblId + " .dragger-column").off("mousedown");
        $("#" + tblId + " .dragger-column").mousedown(function(e) {
            if(TableResizer.DRAG == false)
            {
                var tagname = "th";
                if($(this).parents("th").length > 0)
                    tagname = "th";
                else
                    tagname = "td";
                start = $(this).parents(tagname);
    
                pressedcol = true;
                startX = e.pageX;
                startWidth = $(this).parents(tagname).css("width");
                startHeight = $(this).parents(tagname).css("height");
                $(start).addClass("resizing");
            }
        });
    
        $("#" + tblId + " .dragger-row").off("mousedown");
        $("#" + tblId + " .dragger-row").mousedown(function(e) {
            if(TableResizer.DRAG == false)
            {
                var tagname = "th";
                if($(this).parents("th").length > 0)
                    tagname = "th";
                else
                    tagname = "td";
    
                start = $(this).parents(tagname);
    
                pressedrow = true;
                startY = e.pageY;
                startWidth = $(this).parents(tagname).css("width");
                startHeight = $(this).parents(tagname).css("height");
    
                //$(start).addClass("resizing");
            }
        });

        $(document).mousemove(function(e) {
            
            if(pressedcol) {
                let ww  = parseFloat( startWidth)+(e.pageX-startX);
                
                //$(start).width(ww);
                let colIdx = $(start).attr("col-idx");

                try {
                    let posx = parseFloat($("#" + tblId + " th[col-idx=" + colIdx + "]").position().left);
                    $("#" + tblId + " th[col-idx=" + colIdx + "]").width( ww);
                    $("#" + tblId + " td[col-idx=" + colIdx + "]").width( ww);
                    $("#" + tblId + " th[col-idx=" + colIdx + "] .coladddel-container").css("position", "absolute");
                    $("#" + tblId + " th[col-idx=" + colIdx + "] .coladddel-container").css("left", posx + (ww - 0));
                }
                catch(e)
                {
                    let posx = parseFloat($("#" + tblId + " td[col-idx=" + colIdx + "]").position().left);
                    $("#" + tblId + " td[col-idx=" + colIdx + "]").width( ww);
                    $("#" + tblId + " td[col-idx=" + colIdx + "]").width( ww);
                    $("#" + tblId + " td[col-idx=" + colIdx + "] .coladddel-container").css("position", "absolute");
                    $("#" + tblId + " td[col-idx=" + colIdx + "] .coladddel-container").css("left", posx + (ww - 0));
                }
                
            }
            if(pressedrow) {
                let hh  = parseFloat( startHeight)+(e.pageY-startY);
                let rowIdx = $(start).attr("row-idx");
                $("#" + tblId + " td[row-idx=" + rowIdx + "]").height(hh);
                $("#" + tblId + " th[row-idx=" + rowIdx + "]").height(hh);
            }
        });
        
        $(document).mouseup(function() {
            if(pressedcol) {
                $(start).removeClass("resizing");
                pressedcol = false;
            }
            if(pressedrow) {
                $(start).removeClass("resizing");
                pressedrow = false;
            }

            $("#" + tblId + " th[col-idx]").each(function(){
                let posx = parseFloat($(this).position().left);
                let ww = parseFloat($(this).width());
                $(this).find(".coladddel-container").css("position", "absolute");
                $(this).find(".coladddel-container").css("left", posx + (ww - 0));
            });
        });
    
        $("#" + tblId + " th[col-idx]").each(function(){
            let posx = parseFloat($(this).position().left);
            let ww = parseFloat($(this).width());
            $(this).find(".coladddel-container").css("position", "absolute");
            $(this).find(".coladddel-container").css("left", posx + (ww - 0));
        });
    
        $("#drag-" + tblId).off("mousedown");
        $("#drag-" + tblId).on("mousedown", function(event)
        {
            $(".tbldragger").css("opacity", ".2");
            $("#drag-" + tblId).css("opacity", "1");

            $(".tblcontainer").css("z-index", 1);
            TableResizer.selectedTableId = tblId;
            $("#tbl-container-" + tblId).css("z-index", 10)
            if(event.which == 1)
            {
                $("#tbl-container-" + tblId).draggable();
                
            }
            else if(event.which == 3)
            {
                let data = $(tbl).attr("data")
                data = JSON.parse(data);

                if(document.getElementById("myctx") != null && data.type == "table")
                {
                    let l = $("#tbl-container-" + tblId).css("left");
                    let t = $("#tbl-container-" + tblId).css("top");

                    let ctxMenu = $("#myctx");
                    $(ctxMenu).css("position", "absolute");
                    $(ctxMenu).css("top", t);
                    $(ctxMenu).css("left", l);
                    $(ctxMenu).show();
                }

            }

        })

        $("#" + tblId).off("mousedown");
        $("#" + tblId).on("mousedown", function()
        {
            $(".tbldragger").css("opacity", ".2");
            //$("#tbl-container-" + tblId).draggable();
            $("#drag-" + tblId).css("opacity", "1");

            $(".tblcontainer").css("z-index", 1);
            TableResizer.selectedTableId = tblId;
            $("#tbl-container-" + tblId).css("z-index", 10)

        })
    
        $("#drag-" + tblId).off("mouseup");
        $("#drag-" + tblId).on("mouseup", function()
        {
            $("#tbl-container-" + tblId).draggable('destroy');
        })
    
        $("#drag-" + tblId).off("mouseover");
        $("#drag-" + tblId).on("mouseover", function()
        {
            //$("#drag-" + tblId).css("opacity", "1");
        })
    
        $("#drag-" + tblId).off("mouseout");
        $("#drag-" + tblId).on("mouseout", function()
        {
            //$("#drag-" + tblId).css("opacity", ".2");
        })
    
        $("#"+ tblId + " .coladd").off("click");
        $("#"+ tblId + " .coladd").on("click", function(){
            var th = $(this).parents("th");
            var idx = $(th).attr("col-idx");
            TableResizer.addCol(tbl, idx)
        });

        $("#"+ tblId + " .coldel").off("click");
        $("#"+ tblId + " .coldel").on("click", function(){
            var th = $(this).parents("th");
            var idx = $(th).attr("col-idx");
            TableResizer.delCol(tbl, idx)
        });

        $("#"+ tblId + " .rowflag").off("click");
        $("#"+ tblId + " .rowflag").on("click", function(){
            var th = $(this).parents("tr");
            var idx = $(th).attr("row-idx");
            
            TableResizer.flagRow(tbl, idx)
        });
    
        $("#"+ tblId + " .rowadd").off("click");
        $("#"+ tblId + " .rowadd").on("click", function(){
            var th = $(this).parents("tr");
            var idx = $(th).attr("row-idx");
            
            TableResizer.addRow(tbl, idx)
        });
    
        $("#"+ tblId + " .rowdel").off("click");
        $("#"+ tblId + " .rowdel").on("click", function(){
            var th = $(this).parents("tr");
            var idx = $(th).attr("row-idx");
            
            TableResizer.delRow(tbl, idx)
        });

        
        $("#" + tblId + " th").off("dblclick");
        $("#" + tblId + " th").on("dblclick", function(){
            if(tbl.onCellClick != null)
                tbl.onCellClick(this, tbl);
        })

        $("#" + tblId + " td").off("dblclick");
        $("#" + tblId + " td").on("dblclick", function(){

            let data = $(tbl).attr("data")
            data = JSON.parse(data);

            if(tbl.onCellClick != null && data.type == "form")
                tbl.onCellClick(this, tbl);
        })
    
        $("#ctxAddRows").off("click");
        $("#ctxAddRows").on("click", function(event){
            $("#myctx").hide();

            TableResizer.promptRowNumber(TableResizer.selectedTableId, function(num){
                if(num != null && num > 0)
                {
                    let selectedTbl = document.getElementById(TableResizer.selectedTableId);
                    TableResizer.addRowsEvent(selectedTbl, num, 0)
                }
            });
        })

        $("#ctxClearRows").off("click");
        $("#ctxClearRows").on("click", function(event){
            $("#myctx").hide();
            let selectedTbl = document.getElementById(TableResizer.selectedTableId);
            TableResizer.clearRows(selectedTbl);
        })


        $(document.body).off("click");
        $(document.body).on("click", function(){
            $("#myctx").hide();
        });
        TableResizer.draginit();
        
    }
    ,
    addRowsEvent: function(tbl, num, idx)
    {
        for(let i=0; i < num; i++)
        {
            TableResizer.addRow(tbl, idx);
        }
    }
    ,
    clearRows: function(tbl)
    {
        let totalRows = $(tbl).find("tr").length - 1;

        for(let i=totalRows -1; i > 0; i--)
        {
            TableResizer.delRow(tbl, i);
        }
    }
    ,
    //If tableID is null, it will be automatically created, or else the table's ID uses tableiD specified
    createResizedTable: function(divId, colNum, rowNum, header, data, tableId, onCellClick=null)
    {

        var pressedcol = false;
        var pressedrow = false;
        var start = undefined;
        var startX, startWidth;
        var startY, startHeight;

        var tbl = TableResizer.createTable(divId, colNum, rowNum, header, tableId, onCellClick);
        
        if(data != null)
            $(tbl).attr("data", JSON.stringify(data))

        tbl.onCellClick = onCellClick;

        var tblId = tbl.id;
        var moverDiv = "<div class='tbldragger' id=\"drag-" + tblId + "\"></div>";
        var tableContainer = $("<div style='position:absolute;top:10%;left:10%' class='tblcontainer' id='tbl-container-" + tblId + "'></div>");

        let left = $("canvas").position().left
        let top = $("canvas").position().top
        let width = $("canvas").width();
        let height = $("canvas").height();
        //top = 0;
        //left = 0;
        $("#" + divId).attr("style", "position: absolute; top: " + top + "px; left: " + left + "px; width: " + width + "px; height: " + height + "px;");

        
        $(tableContainer).append(moverDiv);
        $(tableContainer).append(tbl);
        $("#" + divId).append(tableContainer);

        if(document.getElementById("myctx") == null)
        {
            let ctx = TableResizer.getContextMenu();
            $("#" + divId).append(ctx);
        }

        $("#tbl-container-" + tblId).css("z-index", 11)
    
        $("#" + tblId + " th").html(TableResizer.getThContent())        
        $("#" + tblId + " td").html(TableResizer.getTdContent())
        
        TableResizer.setLastTdContent(tbl);
        TableResizer.initTableEvents(tbl);
       

        TableResizer.tables.push({ divId: divId, id: tblId, data: data })
    }
    ,
    createAllResizedTableByInfo: function(divId, infos, onCellClick=null)
    {

        if(infos != null && infos.length >  0)
        {
            infos.map((info) => {
                if(info.type == "form")
                {
                    TableResizer.createResizedTableByInfo(divId, info.tableId, false, info, { type: 'form' }, onCellClick)
                    $("#" + info.tableId + " td").attr("fieldname", info.fieldname )
                    let td = $("#" + info.tableId + " td")[0]
                    TableResizer.refreshCell(td)

                }
                else 
                {
                    TableResizer.createResizedTableByInfo(divId, info.tableId, true, info, { type: 'table' }, onCellClick)
                }

                $("#tbl-container-" + info.tableId).css("left", info.containerPosX)
                $("#tbl-container-" + info.tableId).css("top", info.containerPosY)
            })
        }
    }
    ,
    createResizedTableByInfo: function(divId, tableId, header, info, data, onCellClick=null)
    {

        if(info.totalColumn == null)
            info.totalColumn = 1;

        if(info.totalRows == null)
            info.totalRows = 1;

        if(info.rows == null)
        {
            info.rows = [];
            info.rows.push([{ width: info.width, height: info.height}])
        }
        
        TableResizer.createResizedTable(divId, info.totalColumn, info.totalRows, header, data, tableId, onCellClick );
    
        var table = $("#" + divId).find("table[id='" + tableId + "'")[0];
    
        ////$("#" + divId).css("left", info.containerPosX);
        ////$("#" + divId).css("top", info.containerPosY);
        //$("#" + divId).offset( {left: info.containerPosX});
        //$("#" + divId).offset( {top: info.containerPosY});
    
        
    
        $(table).find("th").each(function(idx){
            $(this).css("width", parseFloat( info.headers[idx].width));
            $(this).css("height", parseFloat( info.headers[idx].height));
            $(this).attr("fieldname", info.headers[idx].fieldname );

            //alert($(this).attr("fieldname"))
            TableResizer.refreshCell($(this)[0])
        });

    
        $(table).find("tr[row-idx]").each(function(rowIdx){
            
            let rowid = $(this).attr("row-idx");
            //console.log("row " +  rowid)
            if(rowid > -1)
            {
                $(this).find("td").each(function(colIdx){
                    $(this).css("height", parseFloat(info.rows[rowid][colIdx].height));
                    $(this).css("width", parseFloat(info.rows[rowid][colIdx].width));
                    if(info.headers != null)
                        $(this).attr("fieldname", info.headers[colIdx].fieldname);

                    //TableResizer.refreshCell($(this)[0])
                })
            }
    
    
        });
    
        TableResizer.setLastTdContent(table);
        TableResizer.initTableEvents(table);


    
    }
    ,
    draginit: function()
    {
    
        
        $(".tbldragger").css("margin-left", "-20px");
        $(".tbldragger").css("opacity", ".2");
        $(".tbldragger").css("cursor", "pointer");
        
    }
    ,
    getContextMenu: function()
    {

        let container = document.createElement("div");
        $(container).css("position", "absolute");
        $(container).css("left", "0px");
        $(container).css("top", "0px"); 

        let promp = document.createElement("div");
        $(promp).attr("id", "promptAddRow");
        $(promp).css("position", "absolute");
        $(promp).addClass("addRowPrompt");
        let html = "<div style='padding: 3px'>How many rows to add?</div><div style='padding: 3px'><input type='number' id='txtRowNum' /></div>";
        html += "<div style='padding: 6px; text-align: center'><button id='btnOkAddRow' style='width: 80px; border: solid 1px #ccc;'>Ok</button>&nbsp;&nbsp;<button id='btnCancelAddRow' style='width: 80px; border: solid 1px #ccc;'>Cancel</button></div>"
        $(promp).html(html)


        let mn = document.createElement("div");
        $(mn).addClass("context-menu");
        $(mn).attr("id", "myctx");

        let mnItem = document.createElement("div");
        $(mnItem).addClass("context-menu-item");
        $(mnItem).html("Add Rows");
        $(mnItem).attr("id", "ctxAddRows");

        $(mn).append(mnItem);


        mnItem = document.createElement("div");
        $(mnItem).addClass("context-menu-item");
        $(mnItem).html("Clear Rows");
        $(mnItem).attr("id", "ctxClearRows");

        $(mn).append(mnItem);

        $(container).append(mn);
        $(container).append(promp);


        return container;
    }
    ,
    promptRowNumber: function(tblId, callback)
    {
        let l = $("#tbl-container-" + tblId).css("left");
        let t = $("#tbl-container-" + tblId).css("top");

        $("#promptAddRow").css("position", "absolute");
        $("#promptAddRow").css("left", l);
        $("#promptAddRow").css("top", t);
        $("#promptAddRow").show("fast");

        $("#btnOkAddRow").off("click");
        $("#btnOkAddRow").on("click", function(){
            $("#promptAddRow").hide();
            let num = $("#txtRowNum").val();
            if(callback != null)
                callback(num);
        })

        $("#btnCancelAddRow").off("click");
        $("#btnCancelAddRow").on("click", function(){
            $("#promptAddRow").hide();
            if(callback != null)
                callback(null);
        })

        $("#txtRowNum").focus();

        $("#txtRowNum").off("keydown");
        $("#txtRowNum").on("keydown", function(event){
            if(event.which == 13)
            {
                $("#btnOkAddRow").click();
            }
        })
    }
    ,
    getAllTableInformation: function(divId, opt)
    {   
        let infos = []
        
        TableResizer.tables.map((tbl) => {
            let info = {};
            let tableId = tbl.id;
            let containerId = "tbl-container-" + tableId + "";

            var tableContainer = $("#" + containerId)   [0];
            //let tableHeight = $("#" + tableId).height();
            //let tableWidth = $("#" + tableId).width();
            //let containerHeight = $(tableContainer).height();

            let tableHeight = parseFloat($("#" + tableId).css("height"));
            let tableWidth = parseFloat($("#" + tableId).css("Width"));
            let containerHeight = parseFloat($(tableContainer).css("height"));

            if( tbl.data != null && tbl.data.type == "form")
            {
                tableHeight = parseFloat($("#" + tableId + " > tr > td").css("height"));
                tableWidth = parseFloat($("#" + tableId + " > tr > td").css("Width"));
            }

            let deltaheight  = containerHeight - tableHeight;

            let posY = parseFloat($(tableContainer).position().top) + deltaheight;
            let posX = parseFloat($(tableContainer).position().left);

            info.tableId = tableId;
            info.tablePosY = posY;
            info.tablePosX = posX;
            info.containerPosY = parseFloat($(tableContainer).position().top);
            info.containerPosX = posX;

            if(tbl.data == null)
                tbl.data = { type: "table" }

            if(tbl.data.type == "table")
            {
                let tableInfo = TableResizer.getTableInformation(divId, tableId, info)
                tableInfo.type = "table";
                infos.push(tableInfo)
            }
            else
            {
                info.height = tableHeight;
                info.width = tableWidth
                info.type = "form";
                info.totalColumn = 1;
                info.totalRows = 1;
                let td = $("#" + tbl.id).find("td")[0];
                if($(td).attr("fieldname") != null)
                    info.fieldname = $(td).attr("fieldname");
                infos.push(info)
            }
        })

        return infos;
    }
    ,
    getTableInformation: function(divId, tableId, info)
    {
        var table = $("#" + divId).find("table[id='" + tableId + "']")[0];
        info.width = parseFloat($(table).css("width"));
        info.height = parseFloat($(table).css("height"));
        info.totalColumn = $(table).find("th").length;
        info.totalRows = $(table).find("tr").length - 1;
    
        info.headers = [];
        info.rows = [];

        let prevheadcell = null;
        let deltax = info.tablePosX;
        let deltay = info.tablePosY;
        let headerHeight = 0;
        let afterHeaderRowPosY = 0;
        $(table).find("th").each(function(){
            let headcell = {};

            //Add fieldname attribute
            if($(this).attr('fieldname'))
                headcell.fieldname = $(this).attr('fieldname')
            
            headcell.width =  parseFloat( $(this).css("width"));
            headcell.height = parseFloat( $(this).css("height"));

            if(prevheadcell != null)
            {
                deltax = prevheadcell.x + prevheadcell.width;
                deltay = prevheadcell.y;
            }
            headcell.x = deltax;
            headcell.y = deltay;

            afterHeaderRowPosY = parseFloat(headcell.y) +  parseFloat(headcell.height);

            info.headers.push(headcell);
            prevheadcell = headcell;
        });
    

        let rowIdx = -1;
        let prevRow = null;
        let rowPosY = 0;
        $(table).find("tr").each(function(){

            if(prevRow == null)
                rowPosY = afterHeaderRowPosY;
            else
            {
                rowPosY = parseFloat( prevRow[0].y) + parseFloat( prevRow[0].height);
            }

    
            if(rowIdx >= 0)
            {
                let row = [];
                let prevCell = null;
                let colPosX = 0;
                let colIdx = 0;
                $(this).find("td").each(function(){
                    let cell = {};

                    if($(this).attr("fieldname") !=  null)
                        cell.fieldname = $(this).attr("fieldname")
                    cell.width = parseFloat($(this).css("width"));
                    cell.height = parseFloat($(this).css("height"));
                    cell.y = rowPosY;
                    cell.x = info.headers[colIdx].x;

                    /*
                    if(prevCell == null)
                    {
                        colPosX = info.posX;
                    }
                    else
                    {
                        colPosX =  parseFloat(prevCell.x) +  parseFloat(prevCell.width);
                    }
                    cell.x = colPosX;
                    */

                    
                    row.push(cell);
                    prevCell = cell;
                    colIdx++;
                });
    
                info.rows.push(row);
                prevRow = row;
            }
    
            rowIdx++;
    
        });
    
        return info;
    }
    ,
    clearTable: function(divId)
    {
        
        $("#" + divId).html("");
        TableResizer.tables = [];
    }
    ,
    refreshCell: function(cell) {

        let fieldname = $(cell).attr("fieldname");
        if(fieldname != null)
        {
            
            $(cell).find(".dragger-column-container .field-displayer").remove();
            let div = "<div class='field-displayer' style='background-color:#0f0; opacity: 0.5; width:100%; height:100%;'></div>";
            $(div).off("dblclick");
            $(div).on("dblclick", function(){
                cell.click();
            })

            
            //console.log($(cell).children().find(".dragger-column-container"))
            //(cell).html(div)
            $(cell).children().find(".dragger-column-container").prepend(div)

            //let dd = $("th[fieldname='amount']");
            //console.log(dd)
            //$("th[fieldname='amount']").html(div)
        }
        else {
            $(cell).find(".dragger-column-container .field-displayer").remove();
        }
    }
    ,
    removeSelectedTable: function(divId)
    {
        if(TableResizer.tables != null)
        {
            let idx = 0;
            let foundIdx  = 0;
            TableResizer.tables.map((table)=>{
                if(TableResizer.selectedTableId != null  && TableResizer.selectedTableId == table.id)
                {
                    $("#tbl-container-" + table.id).remove();
                    foundIdx = idx;
                }
                idx++;
            })

            TableResizer.tables.splice(foundIdx,1)
        }
    }

}