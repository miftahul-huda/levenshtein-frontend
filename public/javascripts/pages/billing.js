export class BillingPage
{
    init(config, session)
    {
        console.log("session")
        console.log(session)
        var me = this;
        me.config = config;
        me.session = session;

        GLOBAL.session.user = {
            email: session.email,
            name: session.name,
            userRole: session.role
        }

        $('#startDate').datetimepicker({
            format: 'DD/MM/YYYY' 
        });

        $('#endDate').datetimepicker({
            format: 'DD/MM/YYYY' 
        });

        let curDate = new Date();
        let dt1 = "01/" + (curDate.getMonth() + 1) + "/" + curDate.getFullYear();
        let dt2 =  curDate.getDate() + "/" + (curDate.getMonth() + 1) + "/" + curDate.getFullYear();

        $('#startDate').val(dt1);
        $('#endDate').val(dt2);

        me.loadAndDisplayBillingData(me);

        $("#btn-display-billing").on("click", function(){
            me.loadAndDisplayBillingData(me);
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

    loadAndDisplayBillingData(me)
    {
        let dt1 = $("#startDate").val();
        dt1 = me.toYYYYMMDD(dt1);

        let dt2 = $("#endDate").val();
        dt2 = me.toYYYYMMDD(dt2);

        $("#processgif").show();
        me.getBillingData(me, dt1, dt2).then((billingInfo)=>{
            me.displayBillingInfo(me, billingInfo)
            $("#processgif").hide();
        }).catch((e)=>{
            $("#processgif").hide();
        })
    }

    toYYYYMMDD(dt)
    {
        let elements = dt.split("/")
        let day = elements[0]
        let month = elements[1]
        let year = elements[2]

        return year + "-" + month + "-" + day;
    }

    getBillingData(me, dt1, dt2)
    {
        let promise = new Promise((resolve, reject)=>{
            let url = me.config.LEVENSHTEIN_API + "/billing/info?date1=" + dt1 + "&date2=" + dt2;
            console.log(url)
            AppUtil.get(url, function(response){
                if(response.success)
                {
                    resolve(response.payload)
                }
                else 
                {
                    reject(response.error)
                }
            }, { user: GLOBAL.session.user   })
        })
        return promise;
    }

    displayBillingInfo(me, billingInfo)
    {
        let rows = me.initRows(billingInfo.items)
        let cols = me.getColumns(me);

        console.log("displayBillingInfo")
        console.log(rows)

        if(me.table != null)
            me.table.destroy();
        me.table = $('#billingList').DataTable( {
            data: rows,
            columns: cols,
            paging: false,
            searching: false
        });

        $("#totalCost").html("Rp. " + billingInfo.totalCost.toLocaleString("id-ID"))
    }

    getColumns(me)
    {
        let cols = [
            { data: 'sessionID'},
            { data: 'sessionDate' },
            { data: 'executedBy' },   
            { data: 'document' },
            { data: 'totalPage' }
        ];

        if(me.session.role == "ADMIN" || me.session.role == "SUPER_ADMIN")
            cols.push({ data: 'totalCost' })

        return cols;
    }

    getTableId()
    {
        return "billingList";
    }

    initRows(rows)
    {
        rows.map((row)=>{
            row["totalCost"] = row["totalCost"].toLocaleString('id-ID');
        })
        
        return rows;
    }

    initEvents()
    {
    }

}