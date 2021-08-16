proxy = 'https://hasocsubmission.el.r.appspot.com'

function logout() {
    document.cookie = "token= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    localStorage.clear()
    window.location = 'login.html'
}

function password2() {
    var password = document.getElementById("Password").value
    var new_password = document.getElementById("NewPassword").value
    if (password == new_password) {
        document.getElementById("passworderr").innerHTML = "New Password cant be same"
    } else {
        document.getElementById("passworderr").innerHTML = ""
    }
}

function password() {
    var new_password = document.getElementById("NewPassword").value
    var confirm_passowrd = document.getElementById("ConfirmPassword").value
    if (new_password == confirm_passowrd) {
        document.getElementById("passworderr").innerHTML = ""
    } else {
        document.getElementById("passworderr").innerHTML = "Password doesnt match"
    }
}

async function changepassword() {
    var password = document.getElementById("Password").value
    var new_password = document.getElementById("NewPassword").value
    var confirm_passowrd = document.getElementById("ConfirmPassword").value
    if (new_password == confirm_passowrd) {
        $.ajax({
            type: 'POST',
            url: proxy + "/user/change_password",
            headers: {
                "x-access-token": getCookie('token'),
                'content-type': 'application/json'
            },
            data: JSON.stringify({
                "team_name": getCookie('user'),
                "password": password,
                "new_password": new_password
            }),
            success: function(result) {
                $('#close_modal').click() //document.getElementById('myModal4').style.display = "none";
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed Successfully'
                })
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 402) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid password',
                    })
                }
                if (jqXHR.status == 401) {
                    window.location = "login.html"
                }
            }

        });
    } else {
        var passerr = document.getElementById('passworderr');
        passerr.innerHTML = "Password and Confirm Password Must be Same"
        passerr.removeAttribute("hidden")
    }
}

function check_token() {
    if (getCookie('token' == null || getCookie('user') == null)) {
        window.location = 'login.html';
    } else {
        leaderboard_table()
    }
}


function leaderboard_table() {
    document.getElementById("zero_submission_div").setAttribute("hidden", true)
    const urlParams = new URLSearchParams(window.location.search);
    task_name = urlParams.get('subtask_name')
    if (task_name == null) {
        var task_name = document.getElementById("leaderboard_task").value
    } else {
        var selectionIndex = {
            "1A_English": 0,
            "1B_English": 1,
            "1A_Hindi": 2,
            "1B_Hindi": 3,
            "1A_Marathi": 4,
            "2_ICHCL": 5
        }
        document.getElementById("leaderboard_task").selectedIndex = selectionIndex[task_name]
    }
    window.history.pushState({}, document.title, "" + "leaderboard.html");
    var leaderboard_table = document.getElementById('leaderboard_table_body')
    var tab = ``
    var user = getCookie('user')
    document.getElementById("navbarDropdownMenuLink").innerHTML = `Welcome ${user} 🤗`
    $.ajax({
        type: 'POST',
        url: proxy + "/leaderboard",
        headers: {
            "x-access-token": getCookie('token'),
            'content-type': 'application/json'
        },
        data: JSON.stringify({
            "task_name": task_name
        }),
        success: function(result) {
            if (result.length <= 2) {
                document.getElementById("footer_div").classList.add("position-fixed")
            }
            if (result.length >= 2) {
                if (document.getElementsByClassName('footer position-fixed bg-dark').length > 0) {
                    document.getElementById("footer_div").classList.remove("position-fixed")
                }
            }
            var task_titles = {
                "1A_English": "English Subtask A",
                "1B_English": "English Subtask B",
                "1A_Hindi": "Hindi Subtask A",
                "1B_Hindi": "Hindi Subtask B",
                "1A_Marathi": "Marathi Subtask A",
                "2_ICHCL": "Subtask 2"
            }
            for (var i = 0; i < result.length; i++) {
                if (result[i].team_name == user) {
                    tab += `<tr class="bg-info h5 text-white">
                    <td class="text-center align-middle"><h4>${i+1}</h4></td>
                    <td class="text-center align-middle">${result[i].team_name}</td>
                    <td class="text-center align-middle">${task_titles[result[i].task_name]}</td>
                    <td class="text-center align-middle">${result[i].timestamp}</td>
                    <td class="text-center align-middle">${result[i].f1_score}</td>
                    <td class="text-center align-middle">${result[i].submission_count}/5</td>
                </tr>`
                } else {
                    tab += `<tr>
                        <td class="text-center align-middle"><h4>${i+1}</h4></td>
                        <td class="text-center align-middle">${result[i].team_name}</td>
                        <td class="text-center align-middle">${task_titles[result[i].task_name]}</td>
                        <td class="text-center align-middle">${result[i].timestamp}</td>
                        <td class="text-center align-middle">${result[i].f1_score}</td>
                        <td class="text-center align-middle">${result[i].submission_count}/5</td>
                    </tr>`
                }
                leaderboard_table.innerHTML = tab
                document.getElementById("body_content").removeAttribute("hidden")
                document.getElementById("loading").setAttribute("hidden", true)
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 401) {
                window.location = "login.html"
            }
            if (jqXHR.status == 404) {
                document.getElementById("body_content").setAttribute("hidden", true)
                document.getElementById("zero_submission_div").removeAttribute("hidden");
                document.getElementById("loading").setAttribute("hidden", true);
            }
        }
    });
}