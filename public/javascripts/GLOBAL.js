var GLOBAL =
{
    session: {
        user: null
    }
    ,
    checkIdle: function()
    {
        let lastLogin = new Date(GLOBAL.session.lastLogin);
        let curTime = new Date(Date.now());
        let interval = (curTime.getTime() - lastLogin.getTime())/1000;

        //console.log("GLOBAL.checkIdle : " + GLOBAL.session.idleTimeout)
        //console.log(interval)

        if(GLOBAL.session.idleTimeout <= interval && GLOBAL.CHECKIDLEON)
        {
            location = "/login/signout";
        }
    }
}