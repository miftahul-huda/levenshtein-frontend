var TableResizer = {
    DRAG: false,
    tables: [],
    clear: function()
    {
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
        for(var i = 0; i < totalCols; i++)
        {
            var td = document.createElement("td");
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
        let divbtnRow = "<div class='rowadddel-container'>" + btnRowAdd + "</div>"
    
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
                let divbtnRow = "<div class='rowadddel-container'>" + btnRowAdd + btnRowDel + "</div>"            
                let newTdContent = "<div class='th-last'><div class='th-last-button-dragger'>" + tdContent + "</div>" + divbtnRow + "</div>"
    
                $(td).html(newTdContent)
            }
        })
    
        var td = null;
        $(tbl).find("th").each(function(){
            td = $(this);
        })
    
        $(td).html(TableResizer.getThLastContent());
    
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
            console.log(tblId)
            if(TableResizer.DRAG == false)
            {
                var tagname = "th";
                if($(this).parents("th").length > 0)
                    tagname = "th";
                else
                    tagname = "td";
                console.log("tagname : "  + tagname)
                start = $(this).parents(tagname);
    
                console.log(start)
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
    
                console.log(start[0])
                pressedrow = true;
                startY = e.pageY;
                startWidth = $(this).parents(tagname).css("width");
                startHeight = $(this).parents(tagname).css("height");
                console.log("startHeight")
                console.log(startHeight)
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
                console.log("here")
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
        $("#drag-" + tblId).on("mousedown", function()
        {
            $("#tbl-container-" + tblId).draggable();
        })
    
        $("#drag-" + tblId).off("mouseup");
        $("#drag-" + tblId).on("mouseup", function()
        {
            $("#tbl-container-" + tblId).draggable('destroy');
        })
    
        $("#drag-" + tblId).off("mouseover");
        $("#drag-" + tblId).on("mouseover", function()
        {
            $("#drag-" + tblId).css("opacity", "1");
        })
    
        $("#drag-" + tblId).off("mouseout");
        $("#drag-" + tblId).on("mouseout", function()
        {
            $("#drag-" + tblId).css("opacity", ".2");
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
            if(tbl.onCellClick != null)
                tbl.onCellClick(this, tbl);
        })
    
        

        TableResizer.draginit();
        
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
    
        $("#" + tblId + " th").html(TableResizer.getThContent())        
        $("#" + tblId + " td").html(TableResizer.getTdContent())
        
        TableResizer.setLastTdContent(tbl);
        TableResizer.initTableEvents(tbl);
       

        TableResizer.tables.push({ divId: divId, id: tblId, data: data })
    }
    ,
    createAllResizedTableByInfo: function(divId, infos, onCellClick=null)
    {
        console.log("infos")
        console.log(infos)
        if(infos != null && infos.length >  0)
        {
            infos.map((info) => {
                if(info.type == "form")
                {
                    console.log("info")
                    console.log(info)
                    TableResizer.createResizedTableByInfo(divId, info.tableId, false, info, { type: 'form' }, onCellClick)
                    $("#" + info.tableId + " td").attr("fieldname", info.fieldname )
                }
                else 
                {
                    console.log("info")
                    console.log(info)
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
        console.log("createResizedTableByInfo");
        
        if(info.totalColumn == null)
            info.totalColumn = 1;

        if(info.totalRows == null)
            info.totalRows = 1;

        if(info.rows == null)
        {
            info.rows = [];
            info.rows.push([{ width: info.width, height: info.height}])
        }
        
        console.log(info);
        TableResizer.createResizedTable(divId, info.totalColumn, info.totalRows, header, data, tableId, onCellClick );
    
        var table = $("#" + divId).find("table[id='" + tableId + "'")[0];
    
        ////$("#" + divId).css("left", info.containerPosX);
        ////$("#" + divId).css("top", info.containerPosY);
        //$("#" + divId).offset( {left: info.containerPosX});
        //$("#" + divId).offset( {top: info.containerPosY});
    
        
    
        $(table).find("th").each(function(idx){
            $(this).css("width", info.headers[idx].width);
            $(this).css("height", info.headers[idx].height);
            $(this).attr("fieldname", info.headers[idx].fieldname );
        });
    
        $(table).find("tr[row-idx]").each(function(rowIdx){
            
            let rowid = $(this).attr("row-idx");
            console.log("row " +  rowid)
            if(rowid > -1)
            {
                $(this).find("td").each(function(colIdx){
                    $(this).css("height", info.rows[rowid][colIdx].height);
                    $(this).css("width", info.rows[rowid][colIdx].width);
                    $(this).attr("fieldname", info.rows[rowid][colIdx].fieldname);
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
    getAllTableInformation: function(divId, opt)
    {   
        let infos = []
        console.log("TABLES")
        console.log(TableResizer.tables);
        
        TableResizer.tables.map((tbl) => {
            let info = {};
            let tableId = tbl.id;
            let containerId = "tbl-container-" + tableId + "";
            console.log(containerId )

            var tableContainer = $("#" + containerId)   [0];
            let tableHeight = $("#" + tableId).height();
            let tableWidth = $("#" + tableId).width();
            let containerHeight = $(tableContainer).height();
            let deltaheight  = containerHeight - tableHeight;

            console.log(tableContainer)
            let posY = parseFloat($(tableContainer).position().top) + deltaheight;
            let posX = parseFloat($(tableContainer).position().left);

            console.log("Position for " + tbl.id)
            console.log("Top : "  +  posY + ", Left :  " + posX)

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
                $(this).find("td").each(function(){
                    let cell = {};

                    if($(this).attr("fieldname") !=  null)
                        cell.fieldname = $(this).attr("fieldname")
                    cell.width = parseFloat($(this).css("width"));
                    cell.height = parseFloat($(this).css("height"));
                    cell.y = rowPosY;

                    if(prevCell == null)
                    {
                        colPosX = info.posX;
                    }
                    else
                    {
                        colPosX =  parseFloat(prevCell.x) +  parseFloat(prevCell.width);
                    }
                    cell.x = colPosX;
                    
                    row.push(cell);
                    prevCell = cell;
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
        TableResizer.table = [];
    }

}