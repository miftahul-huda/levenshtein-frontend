export class AddEditUserPage
{
    init(config, user_id, profile, session)
    {
        var me = this;
        this.config = config;
        this.user_id = user_id;
        me.session = session;
        me.profile = profile

        $("li#" + session.activeLink + " > a > p").css("color", "#cc5522")


        if(profile == true)
        {
            $('#groupUserRole').css("display", 'none')
        }


        
        $("#btn-save-user").on("click", function(){
            let user = me.assembleUser();
            let validation = me.validateUser(user);
            if(validation.valid)
            {
                $("#processgif").show()
                me.saveUser(user).then((response)=>{
                    $.notify("Saving user is succesfull", 'success')
                    $("#processgif").hide()
                    location = '/users'

                }).catch((e)=>{
                    $.notify(e.message, 'error')
                    $("#processgif").hide()
                })
            }
            else
            {
                alert(validation.message)
            }
        })


        $("#btn-cancel-user").on("click", function(){
            location = "/users"
        })

        $("#changePasswordGroup").hide();
        $("#changePassword").on('click', function(){
            if(this.checked)
            {
                me.changePassword = true;
                $("#changePasswordGroup").show();
            }
            else
            {
                me.changePassword = false;
                $("#changePasswordGroup").hide();
            }
        })

        if(me.user_id != null && me.user_id.length > 0)
        {
            me.getUserById(me.user_id).then((user)=>{
                me.displayUser(user)
            })
        }
        else 
        {
            $("#changePasswordCheckGroup").hide()
            $("#changePassword").click();
        }

        
        if(me.session.role == "SUPER_ADMIN")
        {
            $("#userRole").append("<option value='ADMIN'>ADMIN</option>")
        }

        $(document.body).off("mouseover");
        $(document.body).on("mouseover", function(){
            //console.log("onmouseover")
            GLOBAL.session.lastLogin = new Date( Date.now());
            //console.log(GLOBAL.session.lastLogin)
        })

        GLOBAL.CHECKIDLEON = true;
        setInterval(GLOBAL.checkIdle, 1000);

    }

    getUserById(id)
    {
        let promise = new Promise((resolve, reject)=>{

            let url = this.config.LEVENSHTEIN_API + "/users/get/" + id;
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


    assembleUser()
    {
        let me = this;
        let user = {};
        user.firstname = $("#firstname").val();
        user.email = $("#email").val();

        if(me.changePassword)
        {
            user.userPassword = $("#userPassword").val();
            user.confirmPassword = $("#confirmPassword").val();
        }

        if(me.profile != true)
        {
            user.userRole = $("#userRole").val();
        }
            
        return user;
    }

    displayUser(user)
    {
        $("#firstname").val(user.firstname);
        $("#email").val(user.email);
        //$("#userPassword").val(user.userPassword);
        //$("#confirmPassword").val(user.confirmPassword);
        $("#userRole").val(user.userRole);
    }

    async saveUser(user)
    {
        let me = this;
        let promise = new Promise((resolve, reject)=>{
            let levApi = me.config.LEVENSHTEIN_API;
            let url = levApi + "/users/create";
            //alert(me.user_id)
            if(me.user_id != null && me.user_id.length != 0)
                url = levApi + "/users/update/" + me.user_id;

            console.log(url)
            console.log(user);
            $.post(url, JSON.stringify(user), function (response){
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

    validateUser(user)
    {
        let me = this;
        if(user.firstname == null)
            return { valid: false, message: 'Please, enter name'}
        if(user.email == null)
            return { valid: false, message: 'Please, enter email'}
        if(user.userPassword == null && me.changePassword)
            return { valid: false, message: 'Please, enter password'}
        if(user.confirmPassword == null && me.changePassword)
            return { valid: false, message: 'Please, enter confirm password'}
        if(user.userPassword != user.confirmPassword && me.changePassword)
            return { valid: false, message: 'Password and confirm password must be the same'}
        return { valid: true}
    }

}